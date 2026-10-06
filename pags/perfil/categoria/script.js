document.addEventListener(
    "DOMContentLoaded",
    () => {

        const form =
            document.getElementById(
                "categoryForm"
            );


        const currentCategory =
            document.getElementById(
                "currentCategory"
            );


        const newCategory =
            document.getElementById(
                "newCategory"
            );


        const message =
            document.getElementById(
                "message"
            );


        /* =====================================
           CARREGAR DADOS
        ====================================== */

        const data =
            loadData();


        const profile =
            data.profile ||
            {};


        currentCategory.value =
            profile.category ||
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
           SALVAR ALTERAÇÃO
        ====================================== */

        form.addEventListener(
            "submit",
            event => {

                event.preventDefault();

                clearMessage();


                const value =
                    newCategory.value;


                /* ==============================
                   VALIDAÇÃO
                ============================== */

                if (!value) {

                    showMessage(
                        "Selecione uma nova categoria.",
                        "error"
                    );

                    newCategory.focus();

                    return;

                }


                const currentValue =
                    String(
                        profile.category ||
                        ""
                    );


                if (
                    value.toLowerCase() ===
                    currentValue.toLowerCase()
                ) {

                    showMessage(
                        "A nova categoria precisa ser diferente da atual.",
                        "error"
                    );

                    newCategory.focus();

                    return;

                }


                /* ==============================
                   ATUALIZAR BANCO
                ============================== */

                data.profile =
                    data.profile ||
                    {};


                data.profile.category =
                    value;


                saveData(
                    data
                );


                /* ==============================
                   ATUALIZAR TELA
                ============================== */

                currentCategory.value =
                    value;


                newCategory.value =
                    "";


                showMessage(
                    "Categoria alterada com sucesso!",
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


                currentCategory.value =
                    updatedProfile.category ||
                    "";

            }
        );

    }
);