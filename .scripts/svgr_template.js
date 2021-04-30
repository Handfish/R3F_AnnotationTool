function template({ template }, opts, { imports, componentName, props, jsx, exports }) {
    const jsxTemplate = template.smart({ plugins: ['jsx'] });

    //To Debug
    // console.log(JSON.stringify(jsx, null, 4));

    let viewBox = '';

    jsx.openingElement.attributes.forEach((attribute) => {
      if(attribute.name.name == "viewBox")
        viewBox = attribute.value.value;
    })


    function recursiveGetPaths(element, paths = []) {
      element.openingElement.attributes.forEach((attribute) => {
        if(attribute.name.name == "d")
          paths.push(attribute.value.value);
      });

      element.children.forEach((child) => {
        paths = recursiveGetPaths(child, paths);
      })

      return paths;
    }

    paths = recursiveGetPaths(jsx, []);

    paths = paths.map((path) => `'${path}'`).join(', \n');
    
    console.log(paths);

    return jsxTemplate.ast`
      export default {
        viewBox: '${viewBox}',
        paths: [
          ${paths}
        ]
      }
    `
}

module.exports = template;
