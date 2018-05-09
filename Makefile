SHELL := /bin/bash

build_all: react-native weapp

react-native:
	echo "React Native Release:"
	node_modules/webpack/bin/webpack.js --config=webpack/config.react-native.js

weapp:
	echo "Weapp Release:"
	node_modules/webpack/bin/webpack.js --config=webpack/config.weapp.js

.PHONY: build_all
