# Newman Reporter CSV Extra

Add CSV (Extra) reports to your Newman runs.

## About

Each request in a collection run maps to a row in the outputted CSV file with the following columns:

| Column | Description | Example |
| ------ | ------ |  ------ |
| iteration | collection run iteration number | 1 |
| collectionName | name of the collection | My fancy API |
| requestName | name of the request made | Create user |
| method | HTTP method of the request | POST |
| url | URL of the request | http://localhost:3000/user/create |
| status | response status of the request | OK |
| code | response code of the request | 200 |
| responseTime | time taken to receive a response (ms) | 56 |
| responseSize | size of the response (bytes) | 130 |
| executed | tests that passed | Status was 200, User was created |
| failed | tests that failed | User has view permissions |
| skipped | tests that were skipped | User had first name Joe |
| fullName | Full name of the request (Folder + Request Name) | Folder 1/Create user |
| requestBody | the request body | { foo: "bar" } |
| responsebody | the response body | { foo: "bar" } |
> *Note: test names are comma separated | `body` is optional, see [Options](#options)*

## Setup
Ensure you have Newman setup first:

```console
npm install newman --save-dev
```

Then install this package:

```console
npm install newman-reporter-csvextra --save-dev
```

## Usage
You can then use the `-r csvextra` option to make Newman use the CSV (extra) reporter.

```console
npx newman run postman_collection.json -e postman_environment.json -r csvextra
```

## Options

| CLI Option | Description |
| ------ | ------ |
| --reporter-csvextra-export <path> | Specify a path where the output CSV file will be written to disk. If not specified, the file will be written to `newman/` in the current working directory. |
| --reporter-csvextra-noPretty | Preserves the original request/response body instead of formatting with JSON Pretty Print  |

```console
npx newman run postman_collection.json -e postman_environment.json -r csvextra --reporter-csvextra-noPretty
```
