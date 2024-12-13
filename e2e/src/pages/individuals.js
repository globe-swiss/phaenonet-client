const { I, privateProfilePage } = inject();

module.exports = {
  url(individualId) {
    return `/individuals/${individualId}`;
  },
  components: {
    navigation: { css: 'app-nav' },
    header: { css: 'app-individual-header' },
    descriptionHeader: { css: 'app-individual-info' },
    descriptionInfo: { css: 'app-masterdata-info' },
    observations: { css: 'app-individual-observation-view' },
    observationContent: { css: '[data-test-id=observationDate]' }
  },
  description: {
    species: { css: '[data-test-id=individual_species]' },
    name: { css: '[data-test-id=individual_name]' },
    owner: { css: '[data-test-id=individual_creator]' },
    lastObservationDate: locate('span').inside('app-individual-description div').at(3), // unstable
    descriptionFields: {
      environment: { css: '[data-test-id=environment]' },
      altitude: { css: '[data-test-id=altitude]' },
      exposition: { css: '[data-test-id=exposition]' },
      gradient: { css: '[data-test-id=gradient]' },
      shadow: { css: '[data-test-id=shadow]' },
      watering: { css: '[data-test-id=irrigation]' },
      distance: { css: '[data-test-id=distance]' },
      habitat: { css: '[data-test-id=habitat]' },
      forestType: { css: '[data-test-id=forestType]' }
    }
  },
  observations: {
    dateFields: locate('[data-test-id=observationDate]'),
    addButtons: locate('[data-test-id=addObservationIcon]'),
    editButtons: locate('[data-test-id=editObservationIcon]'),
    observationDialog: {
      toggleCalendar: { css: '[data-test-id=datePickerToggle]' },
      calendar: {
        day1: locate('button .mat-calendar-body-cell-content').inside('mat-calendar').at(1),
        day2: locate('button .mat-calendar-body-cell-content').inside('mat-calendar').at(2)
      },
      saveButton: { css: '[data-test-id=saveButton]' },
      deleteButton: { css: '[data-test-id=deleteButton]' }
    }
  },
  map: {
    mapButton: { css: '[data-test-id=mapButton]' },
    humidityButton: { css: '[data-test-id=humidityButton]' },
    temperatureButton: { css: '[data-test-id=temperatureButton]' }
  },
  followButton: { css: '[data-test-id=followButton]' },
  unfollowButton: { css: '[data-test-id=unfollowButton]' },
  editButton: { css: 'app-individual-buttons #edit-button' },
  deleteButton: { css: 'app-individual-buttons #delete-button' },
  deleteDialog: {
    deleteConfirmationButton: { css: 'app-confirmation-dialog button[ng-reflect-dialog-result=true]' }
  },
  deleteIndividual() {
    I.click(this.description.deleteButton);
    I.click(this.deleteDialog.deleteConfirmationButton);
    I.waitForComponents(privateProfilePage.components);
  }
};
