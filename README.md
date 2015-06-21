# HackStack [![Build status](https://circleci.com/gh/rangle/hackstack.svg?style=svg&circle-token=4e9f2c3295779e2494abbf8fc84a8aa4f4da0c3f)](https://circleci.com/gh/rangle/hackstack)

## What is HackStack?

**HackStack** is an Angular module that lets you develop against APIs that
don't exist yet or that aren't complete.

At Rangle.io we spend a lot of time building against API's that are either
non-existent or partially existent.  

Our CEO and CTO gave a talk about a method of getting around this
problem by creating mock API end points that your app can run against.  
You can see the full presentation [here]
(http://yto.io/slides/Building-an-AngularJS-Hack-Stack-2015.pdf)

While the presentation specifies that the HackStack is a methodology, not a
library, the enthusiasm we saw for a library could not be ignored.  This is the
library.

## Installing the service

This needs work, but for now take the HackStack folder out of the core
directory and add it into your project.  You will need to change the module
names appropriately.

Currently the module has it living in the showcase app.

TODO: Make this a bower installable stand alone library.

## Using HackStack

To create a new HackStack endpoint.  Simply call
`hackstack.mock(data)`
OR
`hackstack.wrap(endpoint, mockObject)` if you have a part of an endpoint.

where data is either an array of items or a path to a json file.  That's it,
now you have your mock end point that you can use just like a regular endpoint.

Note that the `hackstack.wrap` service requires that you inject an `API_BASE`
variable that contains the base URL for the API you're wrapping.

### Accessing HackStack from the chrome console

While you're working if you want to force a particular error you can call
`window.hsUtils.forceError(<HTTP ERROR CODE>)` and the next request will
magically return that error.

Similarly, if random errors are entirely too frequent for you, you can disable
them by calling `window.hsUtils.disableErrors(true)`.  Once you decide you
want errors back, you can call `window.hsUtils.disableErrors(false)`.

## Assumptions

This library makes a couple of assumptions:

* You're using AngularJS.  It's designed using AngularJS services.

* You're using an abstraction factory to wrap your end points.  This service
will provide you an object that has methods for getting all records, getting a
single record, creating a record, etc.

## Architecture

### `hackstack.utils`

This service provides methods that are used by both `hackstack.mock` and `hackstack.wrap`
services.  Those functions are:

* `disableErrors(value)`: Disable random error generation. <br/>
  `value` : {boolean}
* `forceError(errorCode)`: Reject with this error code in the next response.
  <br/>
  `errorCode` : {integer}
* `produceError(errorArray)`: Return either an error object or null depending
  on the probability distribution defined in the errorArray <br/>
  `errorArray` : {\[object]} (optional) an array of error objects
* `getErrorByCode(errorCode)`: Returns an error object with error code matching
  `errorCode`. <br/>
  `errorCode` : {integer}
* `randomInt()`: Returns a random integer. <br/>
* `waitForTime()`: Returns a promise that resolves after some time. Used to
  mimic latency <br/>

### `hackstack.mock`

`hackstack.mock` is a service that creates a mock backend from scratch.
To create a HackStack instance, call `hackstack.mock(mockData, options)` where `mockData`
is an array of objects and `options` is an optional argument of type `Object`

A `hackstack.mock` object contains the following methods:

* `getAll()`: Get all results (equivalent to requesting `API_BASE/endpoint/`)
* `get(id)`: Get a single result (equivalent to requesting `API_BASE/endpoint/id`)
* `query()`: Issue a filter against a result set (For now just works the same as
  getAll.
* `create(object, createIdFn)`: Create a new record <br/>
  `object` : {object} <br/>
  `createIdFn` {() -> int} Function that returns an integer to be used as an id
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
