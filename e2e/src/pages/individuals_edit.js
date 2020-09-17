const { I } = inject();

module.exports = {
  newIndividualUrl: '/individuals/new/edit',
  visit(individualId) {
    I.amOnPage('/individuals/' + individualId + '/edit');
    I.waitForElement(this.species.dropdown, 5);
  },
  components: {
    navigation: { css: 'app-nav' },
    header: { css: 'app-individual-edit-header' },
    form: { css: 'app-individual-edit-view' }
  },
  species: {
    dropdown: { css: 'mat-select[formcontrolname="species"]' },
    options: {
      hazel: 'HS'
      // add more if needed
    }
  },
  name: {
    field: { css: 'input[formcontrolname="name"]' }
  },
  //foto - todo: not implemented
  environment: {
    dropdown: { css: 'mat-select[formcontrolname="description"]' },
    options: {
      city: 'ST'
      // add more if needed
    }
  },
  exposition: {
    dropdown: { css: 'mat-select[formcontrolname="exposition"]' },
    options: {
      north: 'N'
      // add more if needed
    }
  },
  gradient: {
    field: { css: 'input[formcontrolname="gradient"]' }
  },
  shade: {
    dropdown: { css: 'mat-select[formcontrolname="shade"]' },
    options: {
      shadow: 'B2'
      // add more if needed
    }
  },
  watering: {
    dropdown: { css: 'mat-select[formcontrolname="watering"]' },
    options: {
      watered: '1'
      // add more if needed
    }
  },
  distance: {
    dropdown: { css: 'mat-select[formcontrolname="less100"]' },
    options: {
      bigger100m: '0'
      // add more if needed
    }
  },
  habitat: {
    dropdown: { css: 'mat-select[formcontrolname="habitat"]' },
    options: {
      woods: 'WA'
      // add more if needed
    }
  },
  forestType: {
    dropdown: { css: 'mat-select[formcontrolname="forest"]' },
    options: {
      mixedForest: 'MW'
      // add more if needed
    }
  },
  fillForm() {
    I.selectDropdownValue(this.species.dropdown, this.species.options.hazel);
    I.fillField(this.name.field, 'e2e-test-obj');
    I.selectDropdownValue(this.environment.dropdown, this.environment.options.city);
    I.selectDropdownValue(this.exposition.dropdown, this.exposition.options.north);
    I.fillField(this.gradient.field, 42);
    I.selectDropdownValue(this.shade.dropdown, this.shade.options.shadow);
    I.selectDropdownValue(this.watering.dropdown, this.watering.options.watered);
    I.selectDropdownValue(this.distance.dropdown, this.distance.options.bigger100m);
    I.selectDropdownValue(this.habitat.dropdown, this.habitat.options.woods);
    I.selectDropdownValue(this.forestType.dropdown, this.forestType.options.mixedForest);
  },
  locateMeButton: { css: 'app-individual-edit-header button' },
  saveButton: { css: 'button[type=submit]' },
  mapMarker: { css: 'google-map img' }
};
