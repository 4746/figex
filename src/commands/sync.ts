import {Command, Flags, ux} from '@oclif/core'
import {ParserOutput} from "@oclif/core/lib/interfaces/parser.js";
import chalk from "chalk";
import {readJson} from "fs-extra/esm";
import {Listr} from "listr2";
import path from "node:path";

import {getBuildVersion} from "../lib/build-version.js";
import {CONFIG_FILE_NAME} from "../lib/constants.js";
import {getDocument} from "../lib/document.js";
import {IFigmaDefaultConf} from "../lib/entities/conf.js";
import {IFigmaIconType} from "../lib/entities/icons.js";
import {TakeSvgCtxTask} from "../lib/entities/take/svg.js";
import {downloadAllIcons, downloadListIcons} from "../lib/icons.js";
import {createSvgSprite, createSvgTypes} from "../lib/svg.js";

/*
 * node --loader ts-node/esm ./bin/dev sync
 * node --loader ts-node/esm ./bin/dev sync --help
 * node --esm --loader ts-node/esm ./bin/dev sync --help
 */
export default class Sync extends Command {
  static description = 'Sync svg icons'

  static examples = [
    '<%= config.bin %> <%= command.id %> --help',
  ]

  static flags = {
    fileId: Flags.string({description: 'Figma fileId or create env.FIGMA_FILE_ID',  env: 'FIGMA_FILE_ID', requiredOrDefaulted: false}),
    nameExportType: Flags.string({description: 'Name enum .ts or .php', requiredOrDefaulted: false}),
    prefixExportType: Flags.string({description: 'Prefix enum', requiredOrDefaulted: false}),
    pathFileTypeTS: Flags.string({description: 'Name enum .ts', requiredOrDefaulted: false}),
    pathFileTypePHP: Flags.string({description: 'Name enum .php', requiredOrDefaulted: false}),
    page: Flags.string({description: '...', env: 'FIGMA_PAGE', requiredOrDefaulted: false}),
    pathFileSprite: Flags.string({description: 'Represents the path to a sprite svg file.', requiredOrDefaulted: false}),
    pathFileType: Flags.string({description: 'Represents the file type of a given path.', requiredOrDefaulted: false}),
    phpNamespace: Flags.string({description: 'The PHP namespace represents the namespace of a PHP enum file.', requiredOrDefaulted: false}),
    phpUse: Flags.string({description: 'Extend enum via use OtherEnums', requiredOrDefaulted: false}),
    showResultTable: Flags.boolean({default: false, required: false}),
    silent: Flags.boolean({default: false, required: false}),
    token: Flags.string({env: 'FIGMA_PERSONAL_TOKEN', requiredOrDefaulted: false})
  }

  private conf: IFigmaDefaultConf;
  private fileId: string;
  private nameExportType: string;
  private prefixExportType: string;
  private pathFileTypeTS: string;
  private pathFileTypePHP: string;
  private page: string;
  private pathFileSprite: string;
  /**
   * The path to the typing file
   */
  private pathFileType: string;
  private phpNamespace: string;
  private phpUse: string;
  private showResultTable: boolean;
  private silent: boolean;

  private taskCreatingTypingFile = async (ctx: TakeSvgCtxTask)=> {
    const p = {
      pathFileType: null,
      buildVersion: getBuildVersion(this.config.pjson.version),
      nameExportType: this.nameExportType,
      names: ctx.typeIcons.map(v => v.typeName).sort(),
      phpNamespace: this.phpNamespace,
      phpUse: this.phpUse,
    }

    if (this.pathFileType) {
      await createSvgTypes({
        ...p,
        pathFileType: this.pathFileType,
        nameExportType: this.prefixExportType ? `E${this.prefixExportType}` : this.nameExportType,
      });
    }
    if (this.pathFileTypeTS) {
      await createSvgTypes({
        ...p,
        pathFileType: this.pathFileTypeTS,
        nameExportType: this.prefixExportType ? `T${this.prefixExportType}` : this.nameExportType,
      });
    }
    if (this.pathFileTypePHP) {
      await createSvgTypes({
        ...p,
        pathFileType: this.pathFileTypePHP,
        nameExportType: this.prefixExportType ? `E${this.prefixExportType}` : this.nameExportType,
      });
    }
  }

  private taskDownloadAllSvg = async (ctx: TakeSvgCtxTask)=> {
    ctx.typeIcons = await downloadAllIcons({
      icons: ctx.icons,
      personalToken: this.token,
      removeFromName: this.conf.removeFromName
    })
  }

  private taskGettingFigmaFile = async (ctx: TakeSvgCtxTask) => {
    ctx.fileId = this.fileId;

    ctx.icons = await getDocument({
      designSystem: this.conf.designSystem,
      fileId: this.fileId,
      page: this.page,
      personalToken: this.token,
    })
  }

  private taskGettingSvgUrls = async (ctx: TakeSvgCtxTask)=> {
    ctx.icons = await downloadListIcons({
      fileId: this.fileId,
      icons: ctx.icons,
      personalToken: this.token
    })
  }

  private taskSaveSvgSprite = async (ctx: TakeSvgCtxTask) => {
    ctx.pathSvgSprite = await createSvgSprite({
      pathFileSprite: this.pathFileSprite,
      typeIcons: ctx.typeIcons
    });
  }

  private token: string;

  public async run(): Promise<void> {
    const {flags} = await this.parse(Sync)

    await this.readConfig();
    this.validateConfig(flags);

    const tasks = new Listr<TakeSvgCtxTask>([
      {
        task: this.taskGettingFigmaFile,
        title: 'Getting the Figma file'
      },
      {
        skip: (ctx) => !ctx?.icons,
        task: this.taskGettingSvgUrls,
        title: 'Getting svg urls'
      },
      {
        skip: (ctx) => !ctx?.icons,
        task: this.taskDownloadAllSvg,
        title: 'Download all svg'
      },
      {
        skip: (ctx) => !ctx?.typeIcons || (!this.pathFileType && !this.pathFileTypeTS && !this.pathFileTypePHP),
        task: this.taskCreatingTypingFile,
        title: 'Creating a typing file'
      },
      {
        skip: (ctx) => !ctx?.typeIcons || !this.pathFileSprite,
        task: this.taskSaveSvgSprite,
        title: 'Save svg sprite'
      }
    ], {
      concurrent: false,
      exitOnError: true,
      silentRendererCondition: this.silent
    });

    tasks.run()
      .then((ctx) => {
        if (ctx.typeIcons && !this.silent && this.showResultTable) {
          this.printResultTable(ctx.typeIcons);
        }

        this.log(chalk.green(`Done!`))
      });
  }

  private printResultTable(items: IFigmaIconType[]) {
    ux.table(items.map((v, k) => ({
      ...v, id: k + 1,
    })), {
      id: {
        minWidth: 10
      },
      typeName: {
        minWidth: 20
      },
      // eslint-disable-next-line perfectionist/sort-objects
      name: {
        minWidth: 20
      },
      size: {
        minWidth: 20,
      }
    }, {
      'no-truncate': true
    })
  }

  /**
   * Reads the configuration file and stores it in the `conf` property.
   *
   * @throws {Error} Throws an error if the configuration file cannot be read.
   * @return {Promise<void>} A promise that resolves when the configuration file is successfully read.
   */
  private async readConfig(): Promise<void>
  {
    this.conf = await readJson(path.join(process.cwd(), CONFIG_FILE_NAME));

    if (!this.conf) {
      throw new Error(chalk.red(`Error read config [${CONFIG_FILE_NAME}]`));
    }
  }

  private validateConfig(flags: ParserOutput['flags'])
  {
    this.token = flags.token ?? this.conf.personalToken;
    if (!this.token) {
      throw new Error(chalk.red(`Please pass FIGMA_PERSONAL_TOKEN to this script and re-run`));
    }

    this.fileId = flags?.fileId ?? this.conf.fileId;
    if (!this.fileId) {
      throw new Error(chalk.red(`Please pass fileId to this script and re-run`));
    }

    this.page = flags?.page ?? this.conf.page;
    if (!this.page) {
      throw new Error(chalk.red(`Please pass page to this script and re-run`));
    }

    this.nameExportType = flags?.nameExportType ?? this.conf.nameExportType;
    this.prefixExportType = flags?.prefixExportType ?? this.conf.prefixExportType;
    this.phpNamespace = flags?.phpNamespace ?? this.conf.phpNamespace;
    this.phpUse = flags?.phpUse ?? this.conf.phpUse;
    this.silent = flags.silent;
    this.showResultTable = flags.showResultTable;

    this.pathFileType = flags?.pathFileType ?? this.conf.pathFileType;
    if (this.pathFileType) {
      this.pathFileType = path.join(process.cwd(), this.pathFileType);
    }
    this.pathFileTypeTS = flags?.pathFileTypeTS ?? this.conf.pathFileTypeTS;
    if (this.pathFileTypeTS) {
      this.pathFileTypeTS = path.join(process.cwd(), this.pathFileTypeTS);
    }
    this.pathFileTypePHP = flags?.pathFileTypePHP ?? this.conf.pathFileTypePHP;
    if (this.pathFileTypeTS) {
      this.pathFileTypePHP = path.join(process.cwd(), this.pathFileTypePHP);
    }

    this.pathFileSprite = flags?.pathFileSprite ?? this.conf.pathFileSprite;
    if (this.pathFileSprite) {
      this.pathFileSprite = path.join(process.cwd(), this.pathFileSprite);
    }
  }
}
