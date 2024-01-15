import {confirm } from '@inquirer/prompts';
import {Command} from '@oclif/core'
import chalk from 'chalk';
import { writeJson } from "fs-extra/esm";
import fs from "node:fs";
import path from "node:path";

import {CONFIG_FILE_NAME, DEFAULT_CONF} from "../../lib/constants.js";

/**
 * node --loader ts-node/esm ./bin/dev make:config
 * node --loader ts-node/esm ./bin/dev make:config --help
 */
export default class MakeConfig extends Command {
  static description = 'Create configuration file'

  static examples = [
    '<%= config.bin %> <%= command.id %>',
  ]

  pathConfig: string;

  async createConfiguration() {
    await writeJson(this.pathConfig, DEFAULT_CONF, {
      encoding: 'utf8',
      spaces: 2
    }).then(() => {
      this.log(chalk.green(`Successful create file [${this.pathConfig}]`));
    }).catch((reason) => {
      this.error(reason);
    });
  }

  public async run(): Promise<void> {
    this.pathConfig =  path.join(process.cwd(), CONFIG_FILE_NAME);

    const stat = fs.statSync(this.pathConfig, {throwIfNoEntry: false});

    if (stat && !stat.isFile()) {
      this.error(chalk.red(`The path is already [${this.pathConfig}] (check the settings file)`));
    } else if (stat) {
      this.log(chalk.green(`The path is already [${this.pathConfig}]`));
    } else {
      const answer = await confirm({
        default: false,
        message: `Create config file [${this.pathConfig}]?`
      }, {
        clearPromptOnDone: true,
      });

      if (answer) {
        await this.createConfiguration();
      }
    }

    this.log(chalk.green(`End!`))
  }
}
