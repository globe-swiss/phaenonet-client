const { I, privateProfilePage } = inject();

module.exports = {
  url(individual_id) {
    return '/individuals/' + individual_id;
  },
  components: {
    navigation: { css: 'app-nav' },
    header: { css: 'app-individual-detail-header' },
    description: { css: 'app-individual-description' },
    observations: { css: 'app-individual-observation-view' }
  },
  description: {
    species: locate('.detail-label').inside('app-individual-description').at(1),
    name: { css: 'app-individual-description .title-individual' },
    owner: { css: 'app-individual-description .creator' },
    lastObservationDate: locate('span').inside('app-individual-description div').at(3), //unstable
    descriptionFields: {
      environment: locate('.detail-info-value').inside('app-individual-description').at(1),
      altitude: locate('.detail-info-value').inside('app-individual-description').at(2),
      exposition: locate('.detail-info-value').inside('app-individual-description').at(3),
      gradient: locate('.detail-info-value').inside('app-individual-description').at(4),
      shadow: locate('.detail-info-value').inside('app-individual-description').at(5),
      watering: locate('.detail-info-value').inside('app-individual-description').at(6),
      distance: locate('.detail-info-value').inside('app-individual-description').at(7),
      habitat: locate('.detail-info-value').inside('app-individual-description').at(8),
      forestType: locate('.detail-info-value').inside('app-individual-description').at(9)
    },
    editButton: { css: 'app-individual-description #edit-button' },
    deleteButton: { css: 'app-individual-description #delete-button' },
    deleteConfirmationButton: { css: 'app-confirmation-dialog button[ng-reflect-dialog-result=true]' }
  },
  deleteIndividual() {
    I.click(this.description.deleteButton);
    I.click(this.description.deleteConfirmationButton);
    I.waitUrlEquals(privateProfilePage.url);
  }
};
