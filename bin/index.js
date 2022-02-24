#!/usr/bin/env node
const { program } = require('commander');
const inquirer = require('inquirer');
const shell = require('shelljs');
const fs = require('fs');
const { warn, log } = require('./utils');

// 配置 template 2 branch
const templateMap = {
  'react-v1': 'react/v1',
};

const gitUrl = 'git@github.com:Z-BLOCK-Labs/mcmTemplate.git';

const promptList = [
  {
    type: 'input',
    messgae: 'please input project name',
    name: 'projectName',
    default: 'mcm-test'
  },
  {
    type: 'list',
    messgae: 'please select project template',
    name: 'modal',
    choices: Object.keys(templateMap),
    default: 'react',
  }
];

const run = async () => {
  const answer = await inquirer.prompt(promptList);

  const dirs = shell.ls('./');
  if (dirs.findIndex(item => item === answer.projectName) > -1) {
    const { force } = await inquirer.prompt([{
      name: 'force',
      default: false,
      message: answer.projectName + " already exists in the directory, overwrite?",
      name: "force",
    }]);
    
    if (!force) {
      return;
    }

    shell.rm('-rf', answer.projectName);
  }
  shell.mkdir(answer.projectName);
  shell.cd(`./${answer.projectName}`);

  if (!shell.which('git')) {
    warn('please gobal env install git');
    return;
  }
  log('git environment test success !!!');

  const cloneRes = shell.exec(`git clone -b ${templateMap[answer.modal]} ${gitUrl}`);
  if (cloneRes.code !== 0) {
    warn('clone fail, please test git ssh or template git success !!!');
    return;
  }
  log('git clone success !!!');

  log('start inject lib, please wait a moment, it will take some time !!!');
  shell.mv('./mcmTemplate/*', `../${answer.projectName}`);

  shell.rm('-rf', 'mcmTemplate');
  shell.rm('-rf', '.git');
  
  const pkgStr = fs.readFileSync('./package.json');
  const pkg = JSON.parse(pkgStr);
  pkg.name = answer.projectName;
  fs.writeFileSync('./package.json', JSON.stringify(pkg));

  if (shell.which('yarn')) {
    shell.exec('yarn install');
  } else if (shell.which('npm')) {
    shell.exec('npm install');
  } else {
    warn('install lib fail，please install yarn or npm');
    return;
  }

  log('lib install success !!!');

  log('project init success !!! \n\r you can try\n\r local dev: npm run start\n\r local build: npm run build !!!');
  
}

run();