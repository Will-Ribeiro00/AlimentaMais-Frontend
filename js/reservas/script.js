const sidebar =
    document.getElementById(
        "sidebar"
    );

const mobileMenu =
    document.getElementById(
        "mobileMenu"
    );

const overlay =
    document.getElementById(
        "overlay"
    );

const currentDate =
    document.getElementById(
        "currentDate"
    );

const reservationsContainer =
    document.getElementById(
        "reservationsContainer"
    );


/* NOVA RESERVA */

const reservationModal =
    document.getElementById(
        "reservationModal"
    );

const openReservationModal =
    document.getElementById(
        "openReservationModal"
    );

const closeReservationModalButton =
    document.getElementById(
        "closeReservationModal"
    );

const cancelReservationButton =
    document.getElementById(
        "cancelReservation"
    );

const reservationForm =
    document.getElementById(
        "reservationForm"
    );

const customerName =
    document.getElementById(
        "customerName"
    );

const reservationOffer =
    document.getElementById(
        "reservationOffer"
    );

const reservationQuantity =
    document.getElementById(
        "reservationQuantity"
    );

const reservationDate =
    document.getElementById(
        "reservationDate"
    );

const reservationStatus =
    document.getElementById(
        "reservationStatus"
    );

const stockInformation =
    document.getElementById(
        "stockInformation"
    );

const previewOffer =
    document.getElementById(
        "previewOffer"
    );

const previewQuantity =
    document.getElementById(
        "previewQuantity"
    );

const previewPrice =
    document.getElementById(
        "previewPrice"
    );


/* STATUS */

const statusModal =
    document.getElementById(
        "statusModal"
    );

const closeStatusModalButton =
    document.getElementById(
        "closeStatusModal"
    );

const cancelStatus =
    document.getElementById(
        "cancelStatus"
    );

const saveStatus =
    document.getElementById(
        "saveStatus"
    );

const selectedReservation =
    document.getElementById(
        "selectedReservation"
    );

const newStatus =
    document.getElementById(
        "newStatus"
    );


let selectedReservationId =
    null;


/* =========================================================
   DATA
========================================================= */

currentDate.textContent =
    getTodayBR();


/* =========================================================
   MENU MOBILE
========================================================= */

mobileMenu.addEventListener(
    "click",
    () => {

        const open =
            sidebar.classList.toggle(
                "open"
            );


        overlay.classList.toggle(
            "active",
            open
        );


        mobileMenu.setAttribute(
            "aria-expanded",
            String(open)
        );

    }
);


overlay.addEventListener(
    "click",
    closeMenu
);


function closeMenu() {

    sidebar.classList.remove(
        "open"
    );


    overlay.classList.remove(
        "active"
    );


    mobileMenu.setAttribute(
        "aria-expanded",
        "false"
    );

}


/* =========================================================
   STATUS
========================================================= */

function statusClass(
    status
) {

    if (
        status === "Retirada"
    ) {

        return "completed";

    }


    if (
        status === "Cancelada"
    ) {

        return "cancelled";

    }


    return "waiting";

}


/* =========================================================
   RENDER
========================================================= */

function renderReservations() {

    const data =
        loadData();


    const offers =
        data.offers.filter(
            offer =>
                data.reservations.some(
                    reservation =>
                        String(
                            reservation.offerId
                        ) ===
                        String(
                            offer.id
                        )
                )
        );


    if (!offers.length) {

        reservationsContainer.innerHTML = `

            <article
                class="offer-group"
            >

                <div
                    class="empty-state"
                >

                    Nenhuma reserva encontrada.

                </div>

            </article>

        `;

        return;

    }


    reservationsContainer.innerHTML =
        offers.map(
            (
                offer,
                index
            ) => {

                const reservations =
                    data.reservations.filter(
                        reservation =>
                            String(
                                reservation.offerId
                            ) ===
                            String(
                                offer.id
                            )
                    );


                const open =
                    index === 0;


                return `

                    <article
                        class="offer-group"
                    >


                        <header
                            class="offer-header"
                        >

                            <h2
                                class="offer-title"
                            >

                                ${escapeHTML(
                                    offer.name
                                )}

                            </h2>


                            <button
                                class="offer-toggle"
                                type="button"
                                aria-expanded="${open}"
                            >

                                <i
                                    class="
                                        fa-solid
                                        ${
                                            open
                                                ? "fa-minus"
                                                : "fa-plus"
                                        }
                                    "
                                ></i>

                            </button>

                        </header>


                        <div
                            class="offer-content"
                            ${
                                open
                                    ? ""
                                    : "hidden"
                            }
                        >


                            <div
                                class="offer-summary"
                            >

                                <div
                                    class="summary-item"
                                >

                                    <span>
                                        Produto
                                    </span>

                                    <strong>
                                        ${escapeHTML(
                                            offer.name
                                        )}
                                    </strong>

                                </div>


                                <div
                                    class="summary-item"
                                >

                                    <span>
                                        R$ original
                                    </span>

                                    <strong>
                                        ${formatCurrency(
                                            offer.originalPrice
                                        )}
                                    </strong>

                                </div>


                                <div
                                    class="summary-item"
                                >

                                    <span>
                                        R$ alimento
                                    </span>

                                    <strong>
                                        ${formatCurrency(
                                            offer.offerPrice
                                        )}
                                    </strong>

                                </div>


                                <div
                                    class="summary-item"
                                >

                                    <span>
                                        Qtd.
                                    </span>

                                    <strong>
                                        ${Number(
                                            offer.quantity
                                        )}
                                    </strong>

                                </div>


                                <div
                                    class="summary-item"
                                >

                                    <span>
                                        Categoria
                                    </span>

                                    <strong>
                                        ${escapeHTML(
                                            offer.category
                                        )}
                                    </strong>

                                </div>


                                <div
                                    class="summary-item"
                                >

                                    <span>
                                        Retirada até
                                    </span>

                                    <strong>
                                        ${escapeHTML(
                                            offer.pickup
                                        )}
                                    </strong>

                                </div>

                            </div>


                            <div
                                class="reservation-list"
                            >

                                ${reservations
                                    .map(
                                        reservation => `

                                            <article
                                                class="reservation-card"
                                            >

                                                <div
                                                    class="reservation-field"
                                                >

                                                    <label>
                                                        Nome
                                                    </label>

                                                    <strong>
                                                        ${escapeHTML(
                                                            reservation.customerName
                                                        )}
                                                    </strong>

                                                </div>


                                                <div
                                                    class="reservation-field"
                                                >

                                                    <label>
                                                        Data Reserva
                                                    </label>

                                                    <strong>
                                                        ${escapeHTML(
                                                            reservation.reservationDate
                                                        )}
                                                    </strong>

                                                </div>


                                                <div
                                                    class="reservation-field"
                                                >

                                                    <label>
                                                        Código
                                                    </label>

                                                    <strong>
                                                        ${escapeHTML(
                                                            reservation.code
                                                        )}
                                                    </strong>

                                                </div>


                                                <div
                                                    class="reservation-field"
                                                >

                                                    <label>
                                                        Status
                                                    </label>


                                                    <span
                                                        class="
                                                            status
                                                            ${statusClass(
                                                                reservation.status
                                                            )}
                                                        "
                                                    >

                                                        ${escapeHTML(
                                                            reservation.status
                                                        )}

                                                    </span>

                                                </div>


                                                <div
                                                    class="reservation-actions"
                                                >

                                                    <button
                                                        class="status-button"
                                                        type="button"
                                                        data-status-id="${reservation.id}"
                                                    >
                                                        Alterar status
                                                    </button>


                                                    <button
                                                        class="
                                                            cancel-reservation-button
                                                        "
                                                        type="button"
                                                        data-cancel-id="${reservation.id}"
                                                        ${
                                                            reservation.status ===
                                                            "Cancelada"
                                                                ? "disabled"
                                                                : ""
                                                        }
                                                    >

                                                        ${
                                                            reservation.status ===
                                                            "Cancelada"
                                                                ? "Reserva cancelada"
                                                                : "Cancelar reserva"
                                                        }

                                                    </button>

                                                </div>

                                            </article>

                                        `
                                    )
                                    .join("")}

                            </div>

                        </div>

                    </article>

                `;

            }
        ).join("");


    bindOfferToggles();

}


/* =========================================================
   EXPANDIR OFERTAS
========================================================= */

function bindOfferToggles() {

    document
        .querySelectorAll(
            ".offer-header"
        )
        .forEach(
            header => {

                const button =
                    header.querySelector(
                        ".offer-toggle"
                    );


                const content =
                    header.parentElement
                        .querySelector(
                            ".offer-content"
                        );


                header.addEventListener(
                    "click",
                    event => {

                        if (
                            event.target.closest(
                                ".offer-toggle"
                            )
                        ) {

                            return;

                        }


                        toggleOfferGroup(
                            button,
                            content
                        );

                    }
                );


                button.addEventListener(
                    "click",
                    event => {

                        event.stopPropagation();


                        toggleOfferGroup(
                            button,
                            content
                        );

                    }
                );

            }
        );

}


function toggleOfferGroup(
    button,
    content
) {

    const opened =
        !content.hasAttribute(
            "hidden"
        );


    const icon =
        button.querySelector(
            "i"
        );


    if (opened) {

        content.setAttribute(
            "hidden",
            ""
        );


        button.setAttribute(
            "aria-expanded",
            "false"
        );


        icon.classList.remove(
            "fa-minus"
        );


        icon.classList.add(
            "fa-plus"
        );


    } else {

        content.removeAttribute(
            "hidden"
        );


        button.setAttribute(
            "aria-expanded",
            "true"
        );


        icon.classList.remove(
            "fa-plus"
        );


        icon.classList.add(
            "fa-minus"
        );

    }

}


/* =========================================================
   PREPARAR MODAL
========================================================= */

function prepareReservationForm() {

    const data =
        loadData();


    const activeOffers =
        getActiveOffers(
            data
        );


    reservationForm.reset();


    reservationQuantity.value =
        "1";


    reservationDate.value =
        getTodayISO();


    reservationDate.min =
        getTodayISO();


    reservationOffer.innerHTML =
        "";


    if (
        activeOffers.length === 0
    ) {

        reservationOffer.innerHTML = `

            <option value="">
                Nenhuma oferta disponível
            </option>

        `;


        reservationOffer.disabled =
            true;

    } else {

        reservationOffer.disabled =
            false;


        activeOffers.forEach(
            offer => {

                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    offer.id;


                option.textContent =
                    `${offer.name} — ${formatCurrency(
                        offer.offerPrice
                    )}`;


                reservationOffer.appendChild(
                    option
                );

            }
        );

    }


    clearErrors();


    updatePreview();

}


function clearErrors() {

    document.getElementById(
        "customerError"
    ).textContent =
        "";


    document.getElementById(
        "offerError"
    ).textContent =
        "";


    document.getElementById(
        "quantityError"
    ).textContent =
        "";


    document.getElementById(
        "dateError"
    ).textContent =
        "";

}


/* =========================================================
   OFERTA SELECIONADA
========================================================= */

function getSelectedOffer() {

    const data =
        loadData();


    return getOfferById(
        data,
        reservationOffer.value
    );

}


/* =========================================================
   PREVIEW
========================================================= */

function updatePreview() {

    const offer =
        getSelectedOffer();


    const quantity =
        Number(
            reservationQuantity.value
        ) || 0;


    if (!offer) {

        stockInformation.textContent =
            "Nenhuma oferta disponível.";


        previewOffer.textContent =
            "-";


        previewQuantity.textContent =
            quantity;


        previewPrice.textContent =
            "R$ 0,00";


        return;

    }


    stockInformation.textContent =
        `Estoque disponível: ${offer.quantity} unidade(s).`;


    reservationQuantity.max =
        offer.quantity;


    previewOffer.textContent =
        offer.name;


    previewQuantity.textContent =
        quantity;


    previewPrice.textContent =
        formatCurrency(
            Number(
                offer.offerPrice
            ) *
            quantity
        );

}


reservationOffer.addEventListener(
    "change",
    updatePreview
);


reservationQuantity.addEventListener(
    "input",
    updatePreview
);


/* =========================================================
   ABRIR NOVA RESERVA
========================================================= */

openReservationModal.addEventListener(
    "click",
    () => {

        prepareReservationForm();


        reservationModal.classList.add(
            "active"
        );


        setTimeout(
            () =>
                customerName.focus(),
            100
        );

    }
);


function closeReservationDialog() {

    reservationModal.classList.remove(
        "active"
    );

}


closeReservationModalButton.addEventListener(
    "click",
    closeReservationDialog
);


cancelReservationButton.addEventListener(
    "click",
    closeReservationDialog
);


reservationModal.addEventListener(
    "click",
    event => {

        if (
            event.target ===
            reservationModal
        ) {

            closeReservationDialog();

        }

    }
);


/* =========================================================
   SALVAR NOVA RESERVA
========================================================= */

reservationForm.addEventListener(
    "submit",
    event => {

        event.preventDefault();


        clearErrors();


        const name =
            customerName.value.trim();


        const offer =
            getSelectedOffer();


        const quantity =
            Number(
                reservationQuantity.value
            );


        const date =
            reservationDate.value;


        let valid =
            true;


        if (
            name.length < 2
        ) {

            document
                .getElementById(
                    "customerError"
                )
                .textContent =
                "Digite um nome válido.";


            valid = false;

        }


        if (!offer) {

            document
                .getElementById(
                    "offerError"
                )
                .textContent =
                "Selecione uma oferta disponível.";


            valid = false;

        }


        if (
            !Number.isInteger(
                quantity
            ) ||
            quantity < 1
        ) {

            document
                .getElementById(
                    "quantityError"
                )
                .textContent =
                "Digite uma quantidade válida.";


            valid = false;

        }


        if (
            offer &&
            quantity >
            Number(
                offer.quantity
            )
        ) {

            document
                .getElementById(
                    "quantityError"
                )
                .textContent =
                `Estoque insuficiente. Disponível: ${offer.quantity}.`;


            valid = false;

        }


        if (
            !date ||
            date <
            getTodayISO()
        ) {

            document
                .getElementById(
                    "dateError"
                )
                .textContent =
                "Escolha hoje ou uma data futura.";


            valid = false;

        }


        if (!valid) {

            return;

        }


        /*
            Releitura para impedir conflito
            de estoque.
        */

        const data =
            loadData();


        const freshOffer =
            getOfferById(
                data,
                offer.id
            );


        if (
            !freshOffer ||
            !freshOffer.active ||
            Number(
                freshOffer.quantity
            ) < quantity
        ) {

            alert(
                "O estoque foi alterado. Atualize a reserva."
            );


            prepareReservationForm();


            return;

        }


        const reservation = {

            id:
                generateId("r_"),

            offerId:
                freshOffer.id,

            offerName:
                freshOffer.name,

            customerName:
                name,

            reservationDate:
                formatISOToBR(
                    date
                ),

            createdAt:
                new Date()
                    .toISOString(),

            code:
                generateReservationCode(
                    data
                ),

            quantity:
                quantity,

            status:
                reservationStatus.value

        };


        /*
            Reserva ativa diminui estoque.
        */

        if (
            reservation.status !==
            "Cancelada"
        ) {

            freshOffer.quantity =
                Math.max(
                    0,
                    Number(
                        freshOffer.quantity
                    ) -
                    quantity
                );

        }


        data.reservations.unshift(
            reservation
        );


        saveData(
            data
        );


        renderReservations();


        closeReservationDialog();


        alert(
            `Reserva criada com sucesso!\nCódigo: ${reservation.code}`
        );

    }
);


/* =========================================================
   ALTERAR STATUS
========================================================= */

document.addEventListener(
    "click",
    event => {

        const button =
            event.target.closest(
                "[data-status-id]"
            );


        if (!button) {
            return;
        }


        openStatusModal(
            button.dataset.statusId
        );

    }
);


function openStatusModal(
    id
) {

    const data =
        loadData();


    const reservation =
        getReservationById(
            data,
            id
        );


    if (!reservation) {
        return;
    }


    selectedReservationId =
        id;


    selectedReservation.textContent =
        `${reservation.customerName} • ${reservation.code}`;


    newStatus.value =
        reservation.status;


    statusModal.classList.add(
        "active"
    );


    setTimeout(
        () =>
            newStatus.focus(),
        100
    );

}


function closeStatusDialog() {

    statusModal.classList.remove(
        "active"
    );


    selectedReservationId =
        null;

}


closeStatusModalButton.addEventListener(
    "click",
    closeStatusDialog
);


cancelStatus.addEventListener(
    "click",
    closeStatusDialog
);


statusModal.addEventListener(
    "click",
    event => {

        if (
            event.target ===
            statusModal
        ) {

            closeStatusDialog();

        }

    }
);


/* =========================================================
   SALVAR STATUS
========================================================= */

saveStatus.addEventListener(
    "click",
    () => {

        if (
            selectedReservationId ===
            null
        ) {

            return;

        }


        const data =
            loadData();


        const reservation =
            getReservationById(
                data,
                selectedReservationId
            );


        if (!reservation) {
            return;
        }


        const oldStatus =
            reservation.status;


        const targetStatus =
            newStatus.value;


        const offer =
            getOfferById(
                data,
                reservation.offerId
            );


        /*
            ATIVA -> CANCELADA
            devolve estoque
        */

        if (
            oldStatus !==
                "Cancelada" &&
            targetStatus ===
                "Cancelada"
        ) {

            if (offer) {

                offer.quantity +=
                    Number(
                        reservation.quantity
                    );

            }

        }


        /*
            CANCELADA -> ATIVA
            retira estoque novamente
        */

        if (
            oldStatus ===
                "Cancelada" &&
            targetStatus !==
                "Cancelada"
        ) {

            if (
                !offer ||
                Number(
                    offer.quantity
                ) <
                Number(
                    reservation.quantity
                )
            ) {

                alert(
                    "Não há estoque suficiente para reativar esta reserva."
                );

                return;

            }


            offer.quantity -=
                Number(
                    reservation.quantity
                );

        }


        reservation.status =
            targetStatus;


        saveData(
            data
        );


        renderReservations();


        closeStatusDialog();

    }
);


/* =========================================================
   CANCELAR RESERVA
========================================================= */

document.addEventListener(
    "click",
    event => {

        const button =
            event.target.closest(
                "[data-cancel-id]"
            );


        if (!button) {
            return;
        }


        cancelReservation(
            button.dataset.cancelId
        );

    }
);


function cancelReservation(
    id
) {

    const data =
        loadData();


    const reservation =
        getReservationById(
            data,
            id
        );


    if (!reservation) {
        return;
    }


    if (
        reservation.status ===
        "Cancelada"
    ) {

        return;

    }


    if (
        !confirm(
            `Cancelar a reserva de ${reservation.customerName}?`
        )
    ) {

        return;

    }


    const offer =
        getOfferById(
            data,
            reservation.offerId
        );


    /*
        Devolve estoque.
    */

    if (offer) {

        offer.quantity +=
            Number(
                reservation.quantity
            );

    }


    reservation.status =
        "Cancelada";


    saveData(
        data
    );


    renderReservations();

}


/* =========================================================
   SINCRONIZAÇÃO
========================================================= */

window.addEventListener(
    DATA_EVENT,
    renderReservations
);


window.addEventListener(
    "resize",
    () => {

        if (
            window.innerWidth > 750
        ) {

            closeMenu();

        }

    }
);


/* =========================================================
   ESC
========================================================= */

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key ===
            "Escape"
        ) {

            closeReservationDialog();

            closeStatusDialog();

            closeMenu();

        }

    }
);


/* =========================================================
   INICIALIZAÇÃO
========================================================= */

renderReservations();