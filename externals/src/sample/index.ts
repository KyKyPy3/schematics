import { Rule, SchematicContext, Tree, chain, externalSchematic } from '@angular-devkit/schematics';

const licenseText = `
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
`;

// You don't have to export the function as default. You can also have more than one rule factory
// per file.
export function sample(options: any): Rule {
  return chain([
    externalSchematic('@schematics/angular', 'component', options),
    (tree: Tree, _context: SchematicContext) => {
      tree.actions.forEach(({ path }) => {
            if (!path.endsWith('.ts')) {
              return;
            }

            const content = tree.read(path);
            if (!content) {
              return;
            }

            if (content.indexOf(licenseText) === -1) {
              tree.overwrite(path, licenseText + content);
            }
        });

      return tree;
    }
  ]);
}
