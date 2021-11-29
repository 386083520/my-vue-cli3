#!/usr/bin/env node

const Service = require('../lib/Service')
const service = new Service(process.cwd()) // 工作目录
console.log('gsdprocess.argv', process.argv)
const rawArgv = process.argv.slice(2)
console.log('gsdrawArgv', rawArgv)
const args = require('minimist')(rawArgv)
console.log('gsdargs', args)
const command = args._[0]
service.run(command, args, rawArgv)
