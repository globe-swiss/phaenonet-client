const { I, privateProfilePage } = inject();

module.exports = {
  url(individualId) {
    return `/individuals/${individualId}`;
  },
  components: {
    navigation: { css: 'app-nav' },
    header: { css: 'app-individual-header[mode=detail]' },
    descriptionHeader: { css: 'app-individual-description-header' },
    descriptionInfo: { css: 'app-individual-description-basic-info' },
    observations: { css: 'app-individual-observation-view' },
    observationContent: { css: '[data-test-id=observationDate]' }
  },
  description: {
    species: { css: '[data-test-id=individual_species]' },
    name: { css: '[data-test-id=individual_name]' },
    owner: { css: '[data-test-id=individual_creator]' },
    lastObservationDate: locate('span').inside('app-individual-description div').at(3), // unstable
    descriptionFields: {
      environment: locate('.individual-description-basic-info__value')
        .inside('app-individual-description-basic-info')
        .at(1),
      altitude: locate('.individual-description-basic-info__value')
        .inside('app-individual-description-basic-info')
        .at(2),
      exposition: locate('.individual-description-basic-info__value')
        .inside('app-individual-description-basic-info')
        .at(3),
      gradient: locate('.individual-description-basic-info__value')
        .inside('app-individual-description-basic-info')
        .at(4),
      shadow: locate('.individual-description-basic-info__value').inside('app-individual-description-basic-info').at(5),
      watering: locate('.individual-description-basic-info__value')
        .inside('app-individual-description-basic-info')
        .at(6),
      distance: locate('.individual-description-basic-info__value')
        .inside('app-individual-description-basic-info')
        .at(7),
      habitat: locate('.individual-description-basic-info__value')
        .inside('app-individual-description-basic-info')
        .at(8),
      forestType: locate('.individual-description-basic-info__value')
        .inside('app-individual-description-basic-info')
        .at(9)
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
  editButton: { css: 'app-individual-description-buttons #edit-button' },
  deleteButton: { css: 'app-individual-description-buttons #delete-button' },
  deleteDialog: {
    deleteConfirmationButton: { css: 'app-confirmation-dialog button[ng-reflect-dialog-result=true]' }
  },
  deleteIndividual() {
    I.click(this.description.deleteButton);
    I.click(this.deleteDialog.deleteConfirmationButton);
    I.waitForComponents(privateProfilePage.components);
  }
};
