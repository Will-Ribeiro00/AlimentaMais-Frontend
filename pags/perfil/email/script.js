document.addEventListener(
    "DOMContentLoaded",
    () => {

        const form =
            document.getElementById(
                "emailForm"
            );

        const currentEmail =
            document.getElementById(
                "currentEmail"
            );

        const newEmail =
            document.getElementById(
                "newEmail"
            );

        const message =
            document.getElementById(
                "message"
            );


        /* =====================================
           CARREGAR EMAIL ATUAL
        ====================================== */

        const data =
            loadData();


        const profile =
            data.profile ||
            {};


        currentEmail.value =
            profile.email ||
            "";


        /* =====================================
           MENSAGEM
        ====================================== */

        function clearMessage() {

            message.textContent =
                "";

            message.className =
                "message";

        }


        function showMessage(
            text,
            type
        ) {

            message.textContent =
                text;

            message.className =
                `message ${type}`;

        }


        /* =====================================
           VALIDAÇÃO
        ====================================== */

        function isValidEmail(
            email
        ) {

            return /^[^\s@]+@[^\s@]+\.[^\s@]+$/
                .test(email);

        }


        /* =====================================
           SALVAR ALTERAÇÃO
        ====================================== */

        form.addEventListener(
            "submit",
            event => {

                event.preventDefault();

                clearMessage();


                const value =
                    newEmail.value
                        .trim()
                        .toLowerCase();


                if (!value) {

                    showMessage(
                        "Digite o novo email.",
                        "error"
                    );

                    newEmail.focus();

                    return;

                }


                if (
                    !isValidEmail(value)
                ) {

                    showMessage(
                        "Digite um email válido.",
                        "error"
                    );

                    newEmail.focus();

                    return;

                }


                if (
                    value ===
                    String(
                        profile.email || ""
                    )
                    .trim()
                    .toLowerCase()
                ) {

                    showMessage(
                        "O novo email precisa ser diferente do atual.",
                        "error"
                    );

                    newEmail.focus();

                    return;

                }


                /* =================================
                   ATUALIZA BANCO
                ================================== */

                data.profile =
                    data.profile ||
                    {};


                data.profile.email =
                    value;


                saveData(
                    data
                );


                /* =================================
                   ATUALIZA TELA
                ================================== */

                currentEmail.value =
                    value;


                newEmail.value =
                    "";


                showMessage(
                    "Email alterado com sucesso!",
                    "success"
                );

            }
        );


        /* =====================================
           SINCRONIZAÇÃO
        ====================================== */

        window.addEventListener(
            DATA_EVENT,
            () => {

                const updatedData =
                    loadData();

                const updatedProfile =
                    updatedData.profile ||
                    {};

                currentEmail.value =
                    updatedProfile.email ||
                    "";

            }
        );

    }
);