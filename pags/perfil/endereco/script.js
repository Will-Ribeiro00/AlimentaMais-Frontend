document.addEventListener(
    "DOMContentLoaded",
    () => {

        const form =
            document.getElementById(
                "addressForm"
            );

        const currentAddress =
            document.getElementById(
                "currentAddress"
            );

        const newAddress =
            document.getElementById(
                "newAddress"
            );

        const message =
            document.getElementById(
                "message"
            );


        /* =====================================
           CARREGAR ENDEREÇO ATUAL
        ====================================== */

        const data =
            loadData();


        const profile =
            data.profile ||
            {};


        currentAddress.value =
            profile.address ||
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
                    newAddress.value.trim();


                const currentValue =
                    String(
                        profile.address ||
                        ""
                    ).trim();


                /* ==============================
                   VALIDAÇÕES
                ============================== */

                if (!value) {

                    showMessage(
                        "Digite o novo endereço.",
                        "error"
                    );

                    newAddress.focus();

                    return;

                }


                if (
                    value.length < 5
                ) {

                    showMessage(
                        "Digite um endereço válido.",
                        "error"
                    );

                    newAddress.focus();

                    return;

                }


                if (
                    value.length > 200
                ) {

                    showMessage(
                        "O endereço pode ter no máximo 200 caracteres.",
                        "error"
                    );

                    newAddress.focus();

                    return;

                }


                if (
                    value.toLowerCase() ===
                    currentValue.toLowerCase()
                ) {

                    showMessage(
                        "O novo endereço precisa ser diferente do atual.",
                        "error"
                    );

                    newAddress.focus();

                    return;

                }


                /* ==============================
                   ATUALIZAR BANCO
                ============================== */

                data.profile =
                    data.profile ||
                    {};


                data.profile.address =
                    value;


                saveData(
                    data
                );


                /* ==============================
                   ATUALIZAR TELA
                ============================== */

                currentAddress.value =
                    value;


                newAddress.value =
                    "";


                showMessage(
                    "Endereço alterado com sucesso!",
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


                currentAddress.value =
                    updatedProfile.address ||
                    "";

            }
        );

    }
);