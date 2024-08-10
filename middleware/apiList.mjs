export function listRoutes(app, res) {
  const routes = [];

  function extractRoutes(stack, prefix = '') {
    stack.forEach((middleware) => {
      if (middleware.route) {
        const methods = Object.keys(middleware.route.methods).map(method => method.toUpperCase());
        routes.push({
          path: prefix + middleware.route.path,
          methods: methods.join(', '),
          params: middleware.route.path.match(/:(\w+)/g) || [],
        });
      } else if (middleware.name === 'router' || (middleware.handle && middleware.handle.stack)) {
        const path = middleware.regexp ? convertRegexToPath(middleware.regexp) : '';
        extractRoutes(middleware.handle.stack, prefix + path);
      }
    });
  }

  function convertRegexToPath(input) {
    const parts = String(input).split('/^')
      .filter(Boolean)
      .map(part => convertString(part.replace(/\\\/\?\(\?\=\\\/\|\$\)\/i/g, '').trim()));
    return `/${parts.join('/')}`;
  }

  function convertString(str) {
    return String(str).slice(2);
  }


  extractRoutes(app._router.stack);

  routes.sort((a, b) => String(a.path).localeCompare(String(b.path)));

  const htmlContent = `
<html lang="en">

<head>
  <title>ERP API</title>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>
    table { border: 1px solid black; }
    th, td { border: 1px solid black; padding: 5px 20px; }
    @font-face { font-family: 'prosans'; font-style: normal; font-weight: 400; src: local('Open Sans'), local('OpenSans'), url(https://fonts.gstatic.com/s/productsans/v5/HYvgU2fE2nRJvZ5JFAumwegdm0LZdjqr5-oayXSOefg.woff2) format('woff2'); }
    * { font-family: prosans; box-sizing: border-box; }
    body { margin: 2em; background: linear-gradient(45deg, #EE9CA7, #FFDDE1); }
    .tble-hed-stick { position: sticky; top: 0; }
  </style>

  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet"
    integrity="sha384-T3c6CoIi6uLrA9TneNEoa7RxnatzjcDSCmG1MXxSR1GAsXEV/Dwwykc2MPK8M2HN" crossorigin="anonymous">
  
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"
    integrity="sha384-C6RzsynM9kWDrMNeT87bh95OGNyZPhcTNXj1NW7RuBCsyN/o0jlpcV8Qyq46cDfL"
    crossorigin="anonymous"></script>
</head>

<body class="p-3">
  <h2 class=" text-dark">SMT APIs</h2>
  <table class="table border display">
    <thead>
      <tr>
        <th class="text-center border tble-hed-stick">SNo</th>
        <th class="text-center border tble-hed-stick">Method</th>
        <th class="text-center border tble-hed-stick">API</th>
        <th class="text-center border tble-hed-stick">Param</th>
      </tr>
    </thead>
    <tbody>
      ${routes.map((item, index) => `
        <tr>
          <td class="border">${index + 1}</td><!--sno-->
          <td class="border" style="background-color: ${bg(item.methods)}">${item.methods}</td><!--method-->
          <td class="border">${item.path}</td><!--api-->
          <td class="border">${item.params.join(', ')}</td><!--param-->
        </tr>`).join('')}
    </tbody>
  </table>
</body>

</html>
    `;

  res.setHeader('Content-Type', 'text/html');
  return res.send(htmlContent);
}

const bg = (method) => {
  if (method.includes("GET")) {
    return 'lightgreen';
  } else if (method.includes("POST")) {
    return 'skyblue';
  } else if (method.includes("PUT")) {
    return 'orange';
  } else {
    return '#FF61D2';
  }
}
