const axios = require('axios');


let getActivityInstances = async (id) => {
    const url = `https://develop.api.monax.io/bpm/activity-instances/${id}/data-mappings`
    console.log('axios with url', url);

    axios.get(url)
        .then(response => {
            console.log('getActivityInstances', response.data.url);
            console.log(response.data.explanation);
        })
        .catch(error => {
            console.log(error);
            throw new Error(`Error ${error}`);
        });

}
/*
curl -X PUT \
  https://develop.api.monax.io/users/login \
      -H 'cache-control: no-cache' \
  -H 'content-type: application/json' \
  -H 'postman-token: a72463de-4856-6b61-b32f-f690d7576011' \
  -d '{
"username": "integration_user",
    "password": "password"
}'
*/

module.exports = {getActivityInstances};






