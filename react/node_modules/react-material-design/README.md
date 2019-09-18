# Material Design for React

[![npm](https://img.shields.io/npm/dm/react-material-design.svg?style=social)](https://www.npmjs.com/package/react-material-design)[![Build Status](https://travis-ci.org/react-material-design/react-material-design.svg?branch=master)](https://travis-ci.org/react-material-design/react-material-design)

React components for [material-components/material-components-web](https://github.com/material-components/material-components-web)'s foundation/adapter classes.
Our web projects use React, and Google Material Design theories. So we decided contribute to the project that best adheres to [Material Design guidelines](https://material.io/guidelines). Plus Material Components is developed by a core team of engineers and UX designers at Google.

## Installation

`yarn add react-material-design`

## Examples

### React

```jsx
import React from 'react';
import ReactDOM from 'react-dom';
import { FAB } from 'react-material-design';

ReactDOM.render(
    <FAB
        location="floating-bottom-right"
        icon="create_new_folder"
    />,
    document.getElementById('root')
);
```

### Script Tag

```html
<html>
  ...
  <script src="https://unpkg.com/react-material-design/build/rmd.min.js"></script>
  <script>
      ...
  </script>
</html>
```

Check out examples directory as well.

## Icons

Ensure that appropriate icon library is added to the `<head>` of your project's html file

* [Material icons](https://material.io/icons): Multiple word icons need to be named with a `-` e.g., `account-circle`
    * `<link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">`
* Other Icon libraries can be used as well
    * [Font Awesome](http://fontawesome.io/icons)

## Project Notes

I want this to work with

* react
* react-router
* have animation

## Useful Links

* [material-components/material-components-web](https://github.com/material-components/material-components-web)
* [Material.io](https://material.io/)
* [Material Design Guidlines](https://material.io/guidelines/)
* [MDC-Web Architecture Overview](https://github.com/material-components/material-components-web/blob/master/docs/architecture.md)
