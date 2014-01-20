## Setup Onion Site

Copy the repository onto a server.

If the server doesn't already have Node.JS, install with:

```
sudo apt-get install nodejs
```

Set up Bower with NPM:

```
npm install -g bower
```

Install all node components:

```
npm install
```

Install all the bower components:

```
cd client
bower install 
```

Bower has some issues, so we need to manually install some compoents:

```
cd bower_components/angular-ui-router/release
curl -O https://raw2.github.com/angular-ui/ui-router/master/release/angular-ui-router.js
curl -O https://raw2.github.com/angular-ui/ui-router/master/release/angular-ui-router.min.js
```

Finally, start the server with Node

```
cd ..
node main.js
```
