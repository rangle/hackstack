angular.module('hackstack demo app')

.constant('mockData', {
  birds: [
    {
      "id": 0,
      "name": "European robin",
      "scientificName": "Erithacus rubecula",
      "age": "55-60 million years",
      "img": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Erithacus_rubecula_with_cocked_head.jpg/300px-Erithacus_rubecula_with_cocked_head.jpg"
    },
    {
      "id": 1,
      "name": "Fawn-breasted bowerbird",
      "scientificName": "Chlamydera cerviniventris",
      "age": "55-60 million years",
      "img": "https://upload.wikimedia.org/wikipedia/commons/e/e2/Stavenn_Chlamydera_cerviniventris.jpg"
    },
    {
      "id": 2,
      "name": "Green-backed kingfisher",
      "scientificName": "Actenoides monachus",
      "age": "~60 million years",
      "img": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f0/Green-backed_Kingfisher_%28Male%29_cropped.jpg/384px-Green-backed_Kingfisher_%28Male%29_cropped.jpg"
    },
    {
      "id": 3,
      "name": "vulturine guineafowl",
      "scientificName": "Acryllium vulturinum",
      "age": "~85 million years",
      "img": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f8/Acryllium_vulturinum_-Tsavo_East_National_Park%2C_Kenya-8.jpg/350px-Acryllium_vulturinum_-Tsavo_East_National_Park%2C_Kenya-8.jpg"
    },
    {
      "id": 4,
      "name": "Atlantic puffin",
      "scientificName": "Fratercula arctica",
      "age": "~70 million years",
      "img": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/Atlantic_puffin_062.jpg/320px-Atlantic_puffin_062.jpg"
    },
    {
      "id": 5,
      "name": "Australian brushturkey",
      "scientificName": "Alectura lathami",
      "age": "~85 million years",
      "img": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fc/Alectura_lathami_-_Centenary_Lakes.jpg/300px-Alectura_lathami_-_Centenary_Lakes.jpg"
    },
    {
      "id": 6,
      "name": "American golden plover",
      "scientificName": "Pluvialis dominica",
      "age": "~70 million years",
      "img": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Pluvialis_dominica1.jpg/320px-Pluvialis_dominica1.jpg"
    },
    {
      "id": 7,
      "name": "Barn swallow",
      "scientificName": "Hirundo rustica",
      "age": "55-60 million years",
      "img": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Barn_swallow_%28Hirundo_rustica_rustica%29_singing.jpg/320px-Barn_swallow_%28Hirundo_rustica_rustica%29_singing.jpg"
    },
    {
      "id": 8,
      "name": "Bornean bristlehead",
      "scientificName": "Pityriasis gymnocephala",
      "age": "55-60 million years",
      "img": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/26/Barite_chauve.JPG/320px-Barite_chauve.JPG"
    }
  ]
})

.constant('mockDataOverrides', {
  birds: {
    "name": "Lorem chicken",
    "scientificName": "Loremius ipsuma",
    "age": "~40 quadrillion years",
    "img": "images/rangle.jpg"
  }
});