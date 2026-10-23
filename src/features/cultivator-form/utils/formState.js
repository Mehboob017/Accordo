export const initialFormState = {
  personalDetails: {
    farmerName: '',
    contactNumber: '',
    email: '',
    address: ''
  },
  medicinalPlants: [
    { id: Date.now().toString(), itemName: '', part: '', quantity: '', packing: '', harvestDate: '' }
  ],
  siteClimate: {
    location: '', distHighway: '', distCity: '', area: '',
    soilType: '', temperature: '', rainfall: '', irrigationSource: '',
    otherCropsSite: '', otherCropsVicinity: ''
  },
  cultivation: {
    plantingMaterial: '', materialSource: '', isCertified: '', certifyingBody: '',
    dateOfPlanting: '', ageAtHarvest: '', harvestSeason: '', isOrganic: '',
    organicCertifyingBody: '', fertilizers: '', pesticides: '', herbicides: '',
    cleaning: '', washing: '', drying: '', sorting: '', packing: ''
  }
};