const fs = require('fs');
const path = require('path');
const bluebird = require('bluebird');
const ejs = require('ejs');
const { PUBLIC_WEB_SITE } = require('../config');

async function compileTemplates() {
  const templateFilepaths = await bluebird.promisify(fs.readdir)(path.join(__dirname, 'templates/')).then(
    (templateFilepaths) => templateFilepaths.filter(
      (templateFilepath) => !!/^(.*).html$/.exec(templateFilepath),
    ),
  );
  const compiledTemplates = await Promise.all(
    templateFilepaths.map(
      async (templateFilepath) => {
        const content = await bluebird.promisify(fs.readFile)(
          path.join(__dirname, `templates/${templateFilepath}`),
          'utf8',
        );
        const template = ejs.compile(content, { root: `${__dirname}/templates` });
        const templateName = /^(.*).html/.exec(templateFilepath)[1];
        return [templateName, template];
      },
    ),
  );
  return new Map(
    compiledTemplates,
  );
}

let availableTemplates = null;
compileTemplates().then(
  (templates) => {
    availableTemplates = templates;
  },
);

module.exports = {
  loadTemplate: async (templateName, params) => {
    if (!availableTemplates) {
      await compileTemplates();
    }
    const template = availableTemplates.get(templateName);
    return template(
      {
        ...params,
        baseSite: PUBLIC_WEB_SITE,
      },
    );
  },
};
