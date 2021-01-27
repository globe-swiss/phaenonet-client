module.exports = {
  url(user) {
    return `/profile/${user.id}/edit`;
  },
  fields: {
    nickname: { css: 'input#nickname' },
    firstname: { css: 'input#firstname' },
    lastname: { css: 'input#lastname' }
  },
  editPasswordIcon: { css: 'mat-icon edit' },
  saveButton: { css: 'button#save-button' },
  cancelButton: { css: 'button#cancel-button' },
  saveButtonEnabled: { css: 'button#save-button:not(:disabled)' },
  saveButtonDisabled: { css: 'button#save-button:disabled' }
};
