require('shelljs/global');
const ora = require('ora');
const fs = require('fs-extra');
const path = require('path');
const inquirer = require('inquirer');
// 导入选项配置
const { readText, nameFormat } = require('./utils/tools');
const promps = require('./config/promps');

const templates = path.resolve(__dirname, `./templates/components`);
const srcPath = path.resolve(__dirname, `../src`);
// 源文件map
const sourceFiles = {
  index: path.resolve(templates, `index.js`),
  vue: path.resolve(templates, `name.vue`),
  scss: path.resolve(templates, `name.scss`),
};

let spinner;
/**
 * 快麦ERP-小程序: 快捷模板构建
 */

async function doTemplate() {
  // 模板类型,模板名称
  let { name } = await inquirer.prompt(promps.comptName);
  try {
    spinner = ora('开始创建组件模板').start();
    createTemplate(name);
  } catch (error) {
    spinner.fail(`组件 ${name} 的目录结构创建失败,错误信息如下:`);
    console.error(error);
  }
}

/**
 * 新建模板
 * @param {String} name 模板名称
 * @param {String} type 模板类型 pages or components
 */
function createTemplate(name) {
  const compPath = path.resolve(__dirname, `../src/components/${name}`);
  // 目标文件map
  const distFiles = {
    index: path.resolve(compPath, `index.js`),
    vue: path.resolve(compPath, `src/${name}.vue`),
    scss: path.resolve(srcPath, `styles/src/${name}.scss`),
  };

  if (fs.existsSync(compPath)) {
    spinner.fail(`组件 ${name} 已经存在,无法创建`);
  } else {
    // 输出index.js
    let idxContent = readText(sourceFiles.index);
    idxContent = idxContent
      .replace('{{__component_name__}}', name)
      .replace(/\{\{__py_component_name__\}\}/g, `Py` + nameFormat(name));
    fs.createFileSync(distFiles.index);
    fs.writeFileSync(distFiles.index, idxContent);

    // 输出默认的vue文件
    fs.createFileSync(distFiles.vue);
    fs.writeFileSync(distFiles.vue, replaceCompName('vue', name));

    // 输出默认的scss文件
    fs.createFileSync(distFiles.scss);
    fs.writeFileSync(distFiles.scss, replaceCompName('scss', name));

    spinner.succeed(`组件 ${name} 的目录结构已完成初始化`);
  }
}

/**
 * 替换模板内占位符为模板名称
 * @param {String} type 文件类型
 * @param {String} name 模板mingc
 */
function replaceCompName(type, name) {
  return readText(sourceFiles[type]).replace(
    /\{\{__py_component_name__\}\}/g,
    `py-${name}`
  );
}

doTemplate();
