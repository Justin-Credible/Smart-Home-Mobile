Smart-Home-Mobile
=============================

A cross-platform mobile application used to control several smart home devices.

* [Iris Smart Home](http://www.lowes.com/cd_Iris_239939199_) (by Lowes)
	* Lighting / Smart Plugs
	* Locks
	* Contact Sensors
	* Thermostat
	* Alarms (intrusion, fire, water leak, etc)
* [IrrigationCaddy](http://irrigationcaddy.com)
* IP Video Cameras

*This is currently a work in progress; more documentation and details will be added as the app progresses.*

[![Build Status](https://travis-ci.org/Justin-Credible/Smart-Home-Mobile.svg?branch=master)](https://travis-ci.org/Justin-Credible/Smart-Home-Mobile)

## Why? ##

I wanted to have a single mobile app to control all of my smart home devices. While Iris has a mobile app, it lacks a few features that I wanted (direct streaming of IP cameras) and only works with Iris devices.

I also wanted to have an app that would be easily extensible so I can add support for non-Iris devices as I add them to my home (eg IrrigationCaddy, Philips Hue bulbs, etc).  

## Application Framework ##

The mobile app is cross-platform and supports Android, iOS, Windows Phone 8 and Windows 8.x 'metro'.

It is built with Ionic, TypeScript, and AngularJS (among others) using the [Ionic-TypeScript-Starter](https://github.com/Justin-Credible/Ionic-TypeScript-Starter) skeleton project.

## Integration APIs ##

### Iris ###

I'm using the AlertMe v5 RESTful API for interacting with Iris. Lowe's does not provide public documentation on their API (which is based on the AlertMe API), but I've found that it is pretty close so far. I've included the API docs that I've found on the web in `resources/IrisApi-v5`.

### IrrigationCaddy ###

IrrigationCaddy also does not provide a public API, but using an HTTP debugging proxy I've been able to sniff the traffic and document it enough to use some basic features. Once complete, this will be located in `resources/IrrigationCaddyApi`.

### IP Video Cameras ###

While each IP camera can be quite different, they usually all have at least one thing in common: an HTTP daemon serving up static images and/or mjpeg content. The mobile app allows the user to enter these URLs (static or streaming) for each camera.

## Getting Started ##

Install [Node.js](https://nodejs.org/) (I've tested with version 0.10.38), clone the project, and then install the node packages:

    $ git clone https://github.com/Justin-Credible/Smart-Home-Mobile.git
    $ cd Smart-Home-Mobile
    $ npm install

Now you can use the various gulp tasks to obtain Cordova plugins, install third party libraries via Bower, download TypeScript definition files and compile the TypeScript code.

    $ gulp libs
    $ gulp plugins
    $ gulp tsd
    $ gulp ts

*You can also just run `gulp` without any arguments which will run the above targets.*

While there are no unit tests the TypeScript code can be linted by using `gulp lint`.

## License ##

Copyright © 2015 Justin Unterreiner.

Released under an MIT license; see [LICENSE](https://github.com/Justin-Credible/Ionic-TypeScript-MDHA-Starter/blob/master/LICENSE) for more information.