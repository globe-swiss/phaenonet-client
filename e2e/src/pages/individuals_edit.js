const { I } = inject();

module.exports = {
  newIndividualUrl: '/individuals/new/edit',
  /**
   * @param {string} individualId
   */
  url(individualId) {
    return `/individuals/${individualId}/edit`;
  },
  components: {
    navigation: { css: 'app-nav' },
    header: { css: 'app-individual-header' },
    form: { css: 'app-individual-edit-form' },
    saveButton: { css: 'button[type=submit]' }
  },
  species: {
    dropdown: { css: '[data-test-id=speciesDropdown]' },
    values: {
      hazel: 'HS'
      // add more if needed
    }
  },
  name: {
    field: { css: 'input[formcontrolname="name"]' }
  },
  // foto - todo: not implemented
  environment: {
    dropdown: { css: 'mat-select[formcontrolname="description"]' },
    values: {
      city: 'ST'
      // add more if needed
    }
  },
  exposition: {
    dropdown: { css: 'mat-select[formcontrolname="exposition"]' },
    values: {
      north: 'N'
      // add more if needed
    }
  },
  gradient: {
    field: { css: 'input[formcontrolname="gradient"]' }
  },
  shade: {
    dropdown: { css: 'mat-select[formcontrolname="shade"]' },
    values: {
      shadow: 'B2'
      // add more if needed
    }
  },
  watering: {
    dropdown: { css: 'mat-select[formcontrolname="watering"]' },
    values: {
      watered: '1'
      // add more if needed
    }
  },
  distance: {
    dropdown: { css: 'mat-select[formcontrolname="less100"]' },
    values: {
      bigger100m: '0'
      // add more if needed
    }
  },
  habitat: {
    dropdown: { css: 'mat-select[formcontrolname="habitat"]' },
    values: {
      woods: 'WA'
      // add more if needed
    }
  },
  forestType: {
    dropdown: { css: 'mat-select[formcontrolname="forest"]' },
    values: {
      mixedForest: 'MW'
      // add more if needed
    }
  },
  fillForm(species = this.species.values.hazel) {
    I.selectDropdownValue(this.species.dropdown, species);
    I.fillField(this.name.field, 'e2e-test-obj');
    I.selectDropdownValue(this.environment.dropdown, this.environment.values.city);
    I.selectDropdownValue(this.exposition.dropdown, this.exposition.values.north);
    I.fillField(this.gradient.field, '42');
    I.selectDropdownValue(this.shade.dropdown, this.shade.values.shadow);
    I.selectDropdownValue(this.watering.dropdown, this.watering.values.watered);
    I.selectDropdownValue(this.distance.dropdown, this.distance.values.bigger100m);
    I.selectDropdownValue(this.habitat.dropdown, this.habitat.values.woods);
    I.selectDropdownValue(this.forestType.dropdown, this.forestType.values.mixedForest);
  },
  locateMeButton: { css: 'app-individual-header button' },
  saveButton: { css: 'button[type=submit]' },
  mapMarker: { css: 'google-map img' }
};
