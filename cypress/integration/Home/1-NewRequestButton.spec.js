describe("Visit DEV Dashboard: Home", function () {
    it(" ", function () {
        try {
            cy.visit("https://dev.dashboard.247jack.com/home?company=Grand%20Residences%20Demo");
        } catch (err) {
            if (confirm("To execute this integration test, please login into the aplication in other tab, after that return to this page an run the test again")) {
                window.open('http://localhost:4200/login', '_blank');
            }
        }
        cy.contains("New Request").click();
        cy.url().should("include", "/home");
        cy.get("angular2-multiselect")
        // .first()
        // .get(".cuppa-dropdown")
        // .click({multiple: true, force: true})
        .should("have.value", "Select Resident");
        // cy.get(" angular2-multiselect").get("cuppa-dropdown").click({multiple: true});
    })
 })


