#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const axios = require('axios');

const URL = {
  domain: 'https://api.azure.sitewrench.com',
  path: '/pageparts/calendars/302440/events-for-map',
  token: 'fe7f339a8875507c82276d692c363448f0053b99',
  siteId: '2552',
}
const endpoint = `${URL.domain}${URL.path}?token=${URL.token}&siteId=${URL.siteId}`;

// for you to change easily
const dataFolder = '/data';
const pathToData = (ext = '.json') => path.join(__dirname, dataFolder, 'upcoming') + ext;

// scrape data, possibly using prior data
async function getData() {
  const { data } = await axios(endpoint);

  return data;
}

// execute and persist data
getData() // no top level await... yet
  .then((data) => {
    // persist data
    fs.writeFileSync(path.resolve(pathToData('.json')), JSON.stringify(data, null, 2));
    fs.writeFileSync(path.resolve(pathToData('.geojson')), JSON.stringify(jsonToGeoJson(data)));
  });

function jsonToGeoJson(json) {
  return  {
    type: 'FeatureCollection',
    features: json
      .filter(row => !!(row.Latitude && row.Longitude))
      .map(row => {
        return {
          type: 'Feature',
          properties: {
            link: `https://roottulsa.com/events/event/${row.EventModuleId}`,
            ...row
          },
          geometry: {
            type: 'Point',
            coordinates: [
              row.Longitude,
              row.Latitude,
            ],
          },
        }
      })
  }
}
