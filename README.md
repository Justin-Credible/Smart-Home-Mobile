Smart-Home-Mobile 
=============================

[![Build Status](https://travis-ci.org/Justin-Credible/Smart-Home-Mobile.svg?branch=master)](https://travis-ci.org/Justin-Credible/Smart-Home-Mobile)
[![Dependencies](https://david-dm.org/Justin-Credible/Smart-Home-Mobile
.svg)](https://david-dm.org/Justin-Credible/Smart-Home-Mobile)

A cross-platform mobile application used to control several smart home devices.

* [Iris Smart Home](http://www.lowes.com/cd_Iris_239939199_) (by Lowes)
	* Lighting / Smart Plugs
	* Locks
	* Contact Sensors
	* Thermostat
	* Alarms (intrusion, fire, water leak, etc)
* [IrrigationCaddy](http://irrigationcaddy.com) (*work in progress*)
* IP Video Cameras

## Why? ##

I wanted to have a single mobile app to control all of my smart home devices. While Iris has a mobile app, it lacks a few features that I wanted (direct streaming of IP cameras) and only works with Iris devices.

I also wanted to have an app that would be easily extensible so I can add support for non-Iris devices as I add them to my home (eg IrrigationCaddy, Philips Hue bulbs, etc).  

## Supported Platforms ##

The mobile app is cross-platform and supports the following platforms:

* Android
* iOS
* Windows 10
* Windows 10 IoT on Raspberry Pi 2

It is built with Ionic, TypeScript, and AngularJS (among others) using the [Ionic-TypeScript-Starter](https://github.com/Justin-Credible/Ionic-TypeScript-Starter) starter project.

See [`getting-started.md`](https://github.com/Justin-Credible/Smart-Home-Mobile/blob/master/getting-started.md) for information on how to build and run the application.

## Integration APIs ##

### Iris ###

I'm using the AlertMe v5 RESTful API for interacting with Iris. Lowe's does not provide public documentation on their API (which is based on the AlertMe API), but I've found that it is pretty close so far. I've included the API docs that I've found on the web in `resources/misc/IrisApi-v5`.

### IrrigationCaddy ###

IrrigationCaddy also does not provide a public API, but using an HTTP debugging proxy I've been able to sniff the traffic and document it enough to use some basic features. Once complete, this will be located in `resources/IrrigationCaddyApi`.

### IP Video Cameras ###

While each IP camera can be quite different, they usually all have at least one thing in common: an HTTP daemon serving up static images and/or mjpeg content. The mobile app allows the user to enter these URLs (static or streaming) for each camera.

## License ##

Copyright © 2015 Justin Unterreiner.

Released under an MIT license; see [LICENSE](https://github.com/Justin-Credible/Ionic-TypeScript-MDHA-Starter/blob/master/LICENSE) for more information.