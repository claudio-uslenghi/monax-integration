const request = require('request');

const optionsLogin = {
  method: 'PUT',
  url: 'https://develop.api.monax.io/users/login/',
  headers:
        {
          'postman-token': '1e811ee8-ae97-aa53-534c-fcdc70278fa5',
          'cache-control': 'no-cache',
          'content-type': 'application/json',
        },
  body: { username: 'integration_user', password: 'password' },
  json: true,
};

const optionsActivity = {
  method: 'GET',
  url: 'https://develop.api.monax.io/bpm/activity-instances/C3BBCA8CCFEC938788AC0ABBAB08E94EF736A4893B38F648C32ECB332B3B1C98/data-mappings',
  headers:
        {
          'cache-control': 'no-cache',

          cookie: 'develop_platform_access_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhZGRyZXNzIjoiNDQ2QjgyNDBDREI3NkVGQjA2MTcwOEJBQ0E5RjBENkMxQjRBOTQ3RSIsInVzZXJuYW1lIjoiaW50ZWdyYXRpb25fdXNlciIsImlhdCI6MTU3MjQ0ODUxOCwiZXhwIjoxNTcyNTM0OTE4LCJpc3MiOiJNb25heC5QbGF0Zm9ybS5Vc2VyIiwic3ViIjoiaW50ZWdyYXRpb25fdXNlciJ9.LWiagep4iYCDh_EeQo4kcB4Wy_T3tQvEXKqwkcLiAu0',

          'content-type': 'application/json',
        },
  body: { username: 'integration_user', password: 'password' },
  json: true,
};


request(optionsLogin, (error, response, body) => {
  console.log('1');
  if (error) {
    throw new Error(error);
  }
  console.log('2');

  // const header = response.headers['authorization'];

  console.log(body);
  console.log('3');

  // invoke task
  request(optionsActivity, (error, response, body) => {
    console.log('4');

    if (error) {
      throw new Error(error);
    }
    console.log('5');

    console.log(body);
  });
});
