import { Rule, Tree, SchematicsException, apply, url, 
         chain, branchAndMerge, mergeWith, noop, filter, template, move } from '@angular-devkit/schematics';
import { strings } from '@angular-devkit/core';
import { buildDefaultPath, getWorkspace } from '@schematics/angular/utility/workspace';
import { parseName } from '@schematics/angular/utility/parse-name';
import { buildRelativePath, findModuleFromOptions } from '@schematics/angular/utility/find-module';
import { addProviderToModule } from '@schematics/angular/utility/ast-utils';
import { InsertChange } from '@schematics/angular/utility/change';
import * as ts from 'typescript';

function readIntoSourceFile(host: Tree, modulePath: string): ts.SourceFile {
  const text = host.read(modulePath);
  if (text === null) {
    throw new SchematicsException(`File ${modulePath} does not exist.`);
  }
  const sourceText = text.toString('utf-8');

  return ts.createSourceFile(modulePath, sourceText, ts.ScriptTarget.Latest, true);
}

function addProviderToNgModule(options: any): Rule {
  return (host: Tree) => {
    const modulePath = options.module;
    const source = readIntoSourceFile(host, modulePath);

    const componentPath = `/${options.path}/`
                          + strings.dasherize(options.name)
                          + '.service';
    const relativePath = buildRelativePath(modulePath, componentPath);
    const classifiedName = strings.classify(`${options.name}Service`);

    const providerChanges = addProviderToModule(
      source,
      modulePath,
      classifiedName,
      relativePath
    );

    const providerRecorder = host.beginUpdate(modulePath);
    for (const change of providerChanges) {
      if (change instanceof InsertChange) {
        providerRecorder.insertLeft(change.pos, change.toAdd);
      }
    }
    host.commitUpdate(providerRecorder);

    return host;
  }; 
}

export function sample(options: any): Rule {
  return async (host: Tree) => {
    if (!options.name) {
      throw new SchematicsException('Name is required.');
    }

    const workspace = await getWorkspace(host);
    if (!options.project) {
      throw new SchematicsException('Option (project) is required.');
    }
    const project = workspace.projects.get(options.project as string);

    if (options.path === undefined && project) {
      options.path = buildDefaultPath(project);
    }

    options.module = findModuleFromOptions(host, options);

    const parsedPath = parseName(options.path, options.name);
    options.name = parsedPath.name;
    options.path = parsedPath.path;

    const templateSource = apply(url('./files'), [
      options.spec ? noop() : filter(path => !path.endsWith('.spec.ts')),
      template({
        ...strings,
        ...options
      }),
      move(options.path || '')
    ]);

    return chain([
      branchAndMerge(
        chain([
          addProviderToNgModule(options),
          mergeWith(templateSource),
        ])
      )
    ]);
  };
}
