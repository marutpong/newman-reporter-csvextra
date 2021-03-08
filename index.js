var _ = require('lodash');

let log
const logs = []
const columns = [
  'iteration',
  'collectionName',
  'requestName',
  'method',
  'url',
  'status',
  'code',
  'responseTime',
  'responseSize',
  'executed',
  'failed',
  'skipped',
  'fullName',
  'requestBody',
  'responseBody',
]

const CSV = {
  stringify: (str) => {
    return `"${str.replace(/"/g, '""')}"`
  }
}

const getFullName = (item, separator) => {
  if (_.isEmpty(item) || !_.isFunction(item.parent) || !_.isFunction(item.forEachParent)) { return; }

  var chain = [];

  item.forEachParent(function (parent) { chain.unshift(parent.name || parent.id); });

  item.parent() && chain.push(item.name || item.id); // Add the current item only if it is not the collection

  return chain.join(_.isString(separator) ? separator : SEP);
}

const prettyJson = (object) => {
  try {
    return JSON.stringify(JSON.parse(object), undefined, 4)
  } catch (error) {
    return object
  }
}

/**
 * Reporter that outputs basic logs to CSV (default: newman-run-report.csv).
 *
 * @param {Object} newman - The collection run object, with event hooks for reporting run details.
 * @param {Object} options - A set of collection run options.
 * @param {String} options.export - The path to which the summary object must be written.
 * @param {String} options.includeBody - Whether the response body should be included in each row.
 * @param {String} options.noPretty - Whether the request/response body should be pretty formatted
 * @returns {*}
 */
module.exports = function newmanCSVExtraReporter (newman, options) {
  // if (options.includeBody) {
  //   columns.push('requestBody')
  //   columns.push('responseBody')
  // }

  // console.log(options)

  newman.on('beforeItem', (err, e) => {
    if (err) return

    log = {}
  })

  newman.on('beforeRequest', (err, e) => {
    if (err || !e.item.name) return
    const { cursor, item, request } = e

    Object.assign(log, {
      collectionName: newman.summary.collection.name,
      iteration: cursor.iteration + 1,
      requestName: item.name,
      method: request.method,
      url: request.url.toString(),
      fullName: getFullName(item, '/'),
    })

    try {
      Object.assign(log, { requestBody: options.noPretty ? request.body.raw : prettyJson(request.body.raw) })
    } catch (error) {
      
    }

  })

  newman.on('request', (err, e) => {

    if (err || !e.item) return

    const { status, code, responseTime, responseSize, stream } = e.response
    Object.assign(log, { status, code, responseTime, responseSize })
    Object.assign(log, { responseBody: options.noPretty ? stream.toString() : prettyJson(stream.toString())})
    // if (options.includeBody) {
    //   Object.assign(log, { responseBody: prettyJson(stream.toString())})
    // }
  })

  newman.on('assertion', (err, e) => {
    const { assertion } = e
    const key = err ? 'failed' : e.skipped ? 'skipped' : 'executed'

    log[key] = log[key] || []
    log[key].push(assertion)
  })

  newman.on('item', (err, e) => {
    if (err) return

    logs.push(log)
  })

  newman.on('beforeDone', (err, e) => {
    if (err) return

    newman.exports.push({
      name: 'csv-extra-reporter',
      default: 'newman-run-report.csv',
      path: options.export,
      content: getResults()
    })

    console.log('CSV (extra) write complete!')
  })
}

function getResults () {
  const results = logs.map((log) => {
    const row = []

    Object.keys(log).forEach((key) => {
      const val = log[key]
      const index = columns.indexOf(key)
      const rowValue = Array.isArray(val)
        ? val.join(', ')
        : String(val)

      row[index] = CSV.stringify(rowValue)
    })

    return row.join(',')
  })

  results.unshift(columns.join(','))

  return results.join('\n')
}
