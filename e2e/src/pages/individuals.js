const { I, privateProfilePage } = inject();

module.exports = {
  url(individualId) {
    return `/individuals/${individualId}`;
  },
  components: {
    navigation: { css: 'app-nav' },
    header: { css: 'app-individual-detail-header' },
    description: { css: 'app-individual-description' },
    observations: { css: 'app-individual-observation-view' }
  },
  description: {
    species: locate('.individual-description__label').inside('app-individual-description-header').at(1),
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
    },
    editButton: { css: 'app-individual-description-buttons #edit-button' },
    deleteButton: { css: 'app-individual-description-buttons #delete-button' },
    deleteConfirmationButton: { css: 'app-confirmation-dialog button[ng-reflect-dialog-result=true]' }
  },
  deleteIndividual() {
    I.click(this.description.deleteButton);
    I.click(this.description.deleteConfirmationButton);
    I.seeElement(privateProfilePage.components.profile);
  }
};
