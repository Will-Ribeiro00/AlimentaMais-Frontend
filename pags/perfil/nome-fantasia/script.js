document.addEventListener(
    "DOMContentLoaded",
    () => {

        const form =
            document.getElementById(
                "fantasyNameForm"
            );


        const currentFantasyName =
            document.getElementById(
                "currentFantasyName"
            );


        const newFantasyName =
            document.getElementById(
                "newFantasyName"
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


        currentFantasyName.value =
            profile.fantasyName ||
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
                    newFantasyName.value
                        .trim();


                /* ==============================
                   VALIDAÇÕES
                ============================== */

                if (!value) {

                    showMessage(
                        "Digite o novo nome fantasia.",
                        "error"
                    );

                    newFantasyName.focus();

                    return;

                }


                if (
                    value.length < 2
                ) {

                    showMessage(
                        "O nome fantasia precisa ter pelo menos 2 caracteres.",
                        "error"
                    );

                    newFantasyName.focus();

                    return;

                }


                if (
                    value.length > 100
                ) {

                    showMessage(
                        "O nome fantasia pode ter no máximo 100 caracteres.",
                        "error"
                    );

                    newFantasyName.focus();

                    return;

                }


                const currentValue =
                    String(
                        profile.fantasyName ||
                        ""
                    )
                    .trim();


                if (
                    value.toLowerCase() ===
                    currentValue.toLowerCase()
                ) {

                    showMessage(
                        "O novo nome fantasia precisa ser diferente do atual.",
                        "error"
                    );

                    newFantasyName.focus();

                    return;

                }


                /* ==============================
                   SALVAR NO BANCO
                ============================== */

                data.profile =
                    data.profile ||
                    {};


                data.profile.fantasyName =
                    value;


                saveData(
                    data
                );


                /* ==============================
                   ATUALIZAR TELA
                ============================== */

                currentFantasyName.value =
                    value;


                newFantasyName.value =
                    "";


                showMessage(
                    "Nome fantasia alterado com sucesso!",
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


                currentFantasyName.value =
                    updatedProfile.fantasyName ||
                    "";

            }
        );

    }
);