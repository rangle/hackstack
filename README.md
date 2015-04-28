# hack-stack

## What is the hack-stack?

At Rangle.io we spend a lot of time building against API's that are either 
non-existent or partially existent.  

At ng-conf, Nick and Yuri gave a talk about a method of getting around this 
problem by creating mock API end points that your app can run against.  
You can see the full presentation here: 
http://yto.io/slides/Building-an-AngularJS-Hack-Stack-2015.pdf

While the presentation specifies that the hack stack is a methodology, not a 
library, the public outcry for a library could not be ignored.  This is the 
library.

## Assumptions

This library makes a couple of assumptions:
* You're using AngularJS.  It's designed using AngularJS services.
* You're using an abstraction factory to wrap your end points.  This service 
will provide you an object that has methods for getting all records, getting a 
single record, creating a record, etc.

## Architecture

This service is a factory that will return you an endpoint object that
has methods for getting data and sending it through methods.  The methods are:

* getAll: Return all results
* get: Get a single result
* query: Issue a filter against a result set (For now just works the same as 
getAll.
* create: Create a new record.
* update: Update a record.
* save: a method that will run create or update depending on presence of an
id.

## Installing the service
This needs work, but for now take the hack-stack folder out of the core 
directory and add it into your project.  You will need to change the module 
names appropriately.

Currently the module has it living in the showcase app.

TODO: Make this a bower installable stand alone library.

## Using the hack-stack
To create a new hack-stack endpoint.  Simply call
`hackStack(data)`
where data is either an array of items or a path to a json file.  That's it,
now you have your mock end point that you can use just like a regular endpoint.
