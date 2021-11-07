#!/usr/bin/env node
const program = require('commander')
program
    .command('create <app-name>')
    .description('create a new project powered by vue-cli-service')
    .action((name, cmd) => {
        const options = cleanArgs(cmd)
        require('../lib/create')(name, options)
    })
program.parse(process.argv)

function cleanArgs (cmd) {
    return cmd
}
