# HackStack [![Build status](https://circleci.com/gh/rangle/hackstack.svg?style=svg&circle-token=4e9f2c3295779e2494abbf8fc84a8aa4f4da0c3f)](https://circleci.com/gh/rangle/hackstack)

## What is HackStack?

**HackStack** is an Angular module that helps you work with backend APIs that
are incomplete or altogether missing.

In our experience working on numerous Angular projects, broken or delayed
backend APIs are quite common and can present a major risk if the front end
team cannot find a good way to react in this situation. After trying a number of
approaches, we've found client-side mocking to the be most effective route.

We've done it a few different ways on a number of projects and presented some of
our observations in a
[talk](http://yto.io/slides/Building-an-AngularJS-Hack-Stack-2015.pdf) at ngConf
in 2015. We've got a lot of positive response, but also a question: "Why don't
you make this a reusable library?" So we did. Enter HackStack.js, the library.

## Installing with Bower

The easiest way to install HackStack is by using bower:

```bash
  bower install --save angular-hackstack
```

Alternatively, build HackStack using this repo.

## Using HackStack

To create a new HackStack endpoint, call:

```js
  var mockEndpoint = hackstack.mock(data);
```

This creates a fully mocked endpoint which won't make any calls to the backend
at all. Here, `data` can be either an array of items or a path to a json file.

Alternatively, you can "wrap" an existing endpoint: HackStack will then get the
data from the server and fill in the missing properties of each item based on a
provided template object:

```js
  var wrappedEndpoint = hackstack.wrap(endpoint, templateObject);
```

### Example

```js
  var mockEndpoint = hackstack.mock([
    {
      'name': 'Alice',
      'id': 1
    },
    {
      'name': 'Bob',
      'id': 2
    }
    ]);

  mockEndpoint.get(1)
    .then(function (response) {
      console.log(response.data); // logs {'name': 'Alice', 'id': 1}
    });
```

A full example is available under the [example directory](./example)

### Controlling HackStack from the Browser Console

While you're working with HackStack, you may want to force a particular error to
happen on the next call to the endpoint. You can do this by exposing the mock
endpoint object to the console and then calling `.forceError(<HTTP ERROR CODE>)`
on it. Subsequent requests will then return that error. Call `.forceError(null)`
to turn this off.

### Random Errors

HackStack defaults to generating random errors in response to endpoint requests.
You can turn this off using `.disableError(true)` on your mock endpoint object.
You can turn it back on by calling the same method with `false`.

### Artificial Delay

HackStack introduces randomized artificial delay on all requests. This helps you
detect cases where your code makes optimistic assumptions about timing.

## Assumptions

This library currently makes a couple of assumptions:

* You're using AngularJS.  It's designed using AngularJS services.

* You're using an abstraction factory to wrap your end points.  This service
will provide you an object that has methods for getting all records, getting a
single record, creating a record, etc.

## Architecture

### `hackstack.utils`

This service provides methods that are used by both `hackstack.mock` and `hackstack.wrap`
services.  Those functions are:

* `addErrorTrigger(errorFn, errorCode, method)`: Adds an "error trigger" that
  will fire if `errorFn(response)` returns true (where `response` is the
  response object that would otherwise be returned by HackStack) <br/>
  `errorFn` : {function} predicate that decides whether error should be returned <br/>
  `errorCode` : {integer} HTTP error code to return <br/>
  `method` : {string} Which HTTP method to check error trigger against (e.g. 'POST')
* `disableRandomErrors(value)`: Disable random error generation. <br/>
  `value` : {boolean}
* `forceError(errorCode)`: Reject with this error code in the next response.
  Reset error if `errorCode` is `null`
  <br/>
  `errorCode` : {integer}
* `produceError(errorArray)`: Return either an error object or null depending
  on the probability distribution defined in the errorArray <br/>
  `errorArray` : {\[object]} (optional) an array of error objects
* `randomError(errorArray)`: Return a random error from an array of errors
  (`errorArray` or the default error array if none provided) <br/>
  `errorArray` : {\[object]} (optional) an array of error objects
* `getErrorByCode(errorCode)`: Returns an error object with error code matching
  `errorCode`. <br/>
  `errorCode` : {integer}
* `randomInt()`: Returns a random integer. <br/>
* `setOptions(newOptions)`: Updates the HackStack options list <br/>
  `newOptions` : {object}
* `waitForTime()`: Returns a promise that resolves after some time. Used to
  mimic latency <br/>

### `hackstack.mock`

`hackstack.mock` is a service that creates a mock backend from scratch.
To create a HackStack instance, call `hackstack.mock(mockData, options)` where `mockData`
is an array of objects and `options` is an optional argument of type `Object`.

Alternatively, `mockData` can be the path to a JSON that is an array of objects

A `hackstack.mock` object contains the following methods:

* `getAll()`: Get all results (equivalent to requesting `API_BASE/endpoint/`)
* `get(id)`: Get a single result (equivalent to requesting `API_BASE/endpoint/id`)
* `query(queryObject)`: get the first result where for any key:value pair in
  `queryObject`, there's a matching key:value pair in the mock data object<br/>
  `queryObject` : {object}
* `create(object, createIdFn)`: Create a new record <br/>
  `object` : {object} <br/>
  `createIdFn` : {() -> int} Function that returns an integer to be used as an id
* `update(object, createIdFn)`: Update a record. <br/>
  signature is identical to `create`
* `save(object, createIdFn)`: a method that will call create or update
  depending on presence of an id. <br/>
  signature is identical to `create`

### `hackstack.wrap`

`hackstack.wrap` is a service that wraps a real backend with a local mock object.
It can be useful if the backend is buggy, returns incomplete data, or is yet to
be fully implemented.

To create a `hackstack.wrap` instance, call `hackstack.wrap(endpoint, mockObject, options)`
where:

* `endpoint` is a string that contains the location of the endpoint
* `mockObject` is a single object used to complete responses from the backend
* `options` is a an object (optional argument)

Note that unlike `hackstack.mock`, you only pass a single object to `hackstack.wrap`.
It will use that one object to complete all of the responses your backend
returns by deep merging the response's properties with the objects

`hackstack.wrap` also requires that you make `API_BASE` available through Angular's
injector. `API_BASE` should be a string that contains the base URL for your
API.

the `hackstack.wrap` factory returns an object which contains the same methods as
a `hackstack.mock` object. Keep in mind however, that `hackstack.wrap` will relay all
requests to the backend, including `post` requests.
