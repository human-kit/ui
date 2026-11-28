#!/usr/bin/env node
// Starts the server on stdio. The client (the editor or the agent) starts this
// process and talks to it on its standard input and output. No port is opened.
//
// The server looks for node_modules/@human-kit/ui/docs from the working
// directory up. Some clients start the process in a different directory, so
// `--project <dir>` (or HUMAN_KIT_PROJECT) gives the project folder.
import { resolve } from 'node:path';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { Docs } from './docs.js';
import { createServer } from './server.js';

const flag = process.argv.indexOf('--project');
const project = flag !== -1 ? process.argv[flag + 1] : process.env.HUMAN_KIT_PROJECT;

const docs = new Docs({ cwd: project ? resolve(project) : process.cwd() });
await createServer(docs).connect(new StdioServerTransport());
