document.addEventListener(
    "DOMContentLoaded",
    () => {

        const data =
            loadData();


        const profile =
            data.profile || {};


        /* =====================================
           ELEMENTOS
        ====================================== */

        const responsibleGreeting =
            document.getElementById(
                "responsibleGreeting"
            );

        const responsibleName =
            document.getElementById(
                "responsibleName"
            );

        const profileCpf =
            document.getElementById(
                "profileCpf"
            );

        const profileCnpj =
            document.getElementById(
                "profileCnpj"
            );

        const profileEmail =
            document.getElementById(
                "profileEmail"
            );

        const profilePhone =
            document.getElementById(
                "profilePhone"
            );

        const profileFantasyName =
            document.getElementById(
                "profileFantasyName"
            );

        const profileAddress =
            document.getElementById(
                "profileAddress"
            );

        const profileCategory =
            document.getElementById(
                "profileCategory"
            );


        /* =====================================
           DADOS DO PERFIL
        ====================================== */

        const name =
            profile.responsibleName ||
            "Padaria São João";


        if (responsibleGreeting) {

            responsibleGreeting.textContent =
                name;

        }


        if (responsibleName) {

            responsibleName.textContent =
                name;

        }


        if (profileCpf) {

            profileCpf.textContent =
                profile.cpf ||
                "--";

        }


        if (profileCnpj) {

            profileCnpj.textContent =
                profile.cnpj ||
                "--";

        }


        if (profileEmail) {

            profileEmail.textContent =
                profile.email ||
                "--";

        }


        if (profilePhone) {

            profilePhone.textContent =
                profile.phone ||
                "--";

        }


        if (profileFantasyName) {

            profileFantasyName.textContent =
                profile.fantasyName ||
                "--";

        }


        if (profileAddress) {

            profileAddress.textContent =
                profile.address ||
                "--";

        }


        if (profileCategory) {

            profileCategory.textContent =
                profile.category ||
                "--";

        }


        /* =====================================
           SINCRONIZAÇÃO COM O BANCO
        ====================================== */

        window.addEventListener(
            DATA_EVENT,
            () => {

                location.reload();

            }
        );

    }
);