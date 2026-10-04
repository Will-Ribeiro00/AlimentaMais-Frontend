const sidebar =
    document.getElementById("sidebar");

const mobileMenu =
    document.getElementById("mobileMenu");

const overlay =
    document.getElementById("overlay");

const currentDate =
    document.getElementById("currentDate");

const stats =
    document.getElementById("stats");

const impactGrid =
    document.getElementById("impactGrid");

const revenueValue =
    document.getElementById("revenueValue");

const revenueCompare =
    document.getElementById("revenueCompare");

const chart =
    document.getElementById("metricsChart");

const chartPeriod =
    document.getElementById("chartPeriod");

const recentReservations =
    document.getElementById(
        "recentReservations"
    );


/* =========================================================
   DATA
========================================================= */

currentDate.textContent =
    getTodayBR();


/* =========================================================
   MENU MOBILE
========================================================= */


if (mobileMenu) {

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

}


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


    if (mobileMenu) {

        mobileMenu.setAttribute(
            "aria-expanded",
            "false"
        );

    }

}
/* =========================================================
   CARDS
========================================================= */

function renderStats(
    data
) {

    const today =
        getTodayBR();


    /*
        Reservas criadas hoje
    */

    const reservationsToday =
        data.reservations.filter(
            reservation =>
                formatDateTimeBR(
                    reservation.createdAt
                ) === today
        );


    /*
        Reservas retiradas hoje
    */

    const withdrawnToday =
        data.reservations.filter(
            reservation =>
                reservation.reservationDate === today &&
                reservation.status === "Retirada"
        );


    /*
        Aguardando hoje
    */

    const waitingToday =
        data.reservations.filter(
            reservation =>
                reservation.reservationDate === today &&
                reservation.status ===
                    "Aguardando retirada"
        );


    /*
        Alimentos salvos
    */

    const savedFoods =
        data.reservations
            .filter(
                reservationIsActive
            )
            .reduce(
                (
                    total,
                    reservation
                ) =>
                    total +
                    Number(
                        reservation.quantity || 0
                    ),
                0
            );


    const items = [

        {
            value:
                reservationsToday.length,

            label:
                "Reservas feitas",

            sub:
                "Hoje",

            icon:
                "fa-user-group"
        },

        {
            value:
                withdrawnToday.length,

            label:
                "Reservas retiradas",

            sub:
                "Hoje",

            icon:
                "fa-bag-shopping"
        },

        {
            value:
                waitingToday.length,

            label:
                "Aguardando",

            sub:
                "Retirada",

            icon:
                "fa-clock"
        },

        {
            value:
                savedFoods,

            label:
                "Alimentos",

            sub:
                "Salvos",

            icon:
                "fa-leaf"
        }

    ];


    stats.innerHTML =
        items.map(
            item => `

                <article class="panel stat-card">

                    <div class="stat-copy">

                        <strong>
                            ${item.value}
                        </strong>

                        <span>
                            ${item.label}
                        </span>

                        <small>
                            ${item.sub}
                        </small>

                    </div>


                    <div class="stat-icon">

                        <i class="
                            fa-solid
                            ${item.icon}
                        "></i>

                    </div>

                </article>

            `
        ).join("");
}


/* =========================================================
   RECEITA
========================================================= */

function monthKeyFromBR(
    brDate
) {

    const [
        day,
        month,
        year
    ] =
        brDate.split("/");


    return `${year}-${month}`;

}


function revenueForMonth(
    data,
    yearMonth
) {

    return data.reservations

        .filter(
            reservationIsActive
        )

        .filter(
            reservation =>
                monthKeyFromBR(
                    reservation.reservationDate
                ) === yearMonth
        )

        .reduce(
            (
                total,
                reservation
            ) => {

                const offer =
                    getOfferById(
                        data,
                        reservation.offerId
                    );


                return (
                    total +
                    Number(
                        offer?.offerPrice || 0
                    ) *
                    Number(
                        reservation.quantity || 0
                    )
                );

            },
            0
        );

}


function renderRevenue(
    data
) {

    const today =
        getTodayISO();


    const [
        year,
        month
    ] =
        today.split("-");


    const currentKey =
        `${year}-${month}`;


    const previousDate =
        new Date(
            Number(year),
            Number(month) - 2,
            1
        );


    const previousKey =
        `${previousDate.getFullYear()}-${
            String(
                previousDate.getMonth() + 1
            ).padStart(2, "0")
        }`;


    const currentRevenue =
        revenueForMonth(
            data,
            currentKey
        );


    const previousRevenue =
        revenueForMonth(
            data,
            previousKey
        );


    revenueValue.textContent =
        formatCurrency(
            currentRevenue
        );


    if (
        previousRevenue <= 0
    ) {

        revenueCompare.textContent =
            "Sem comparação disponível.";

        return;

    }


    const percentage =
        (
            (
                currentRevenue -
                previousRevenue
            ) /
            previousRevenue
        ) *
        100;


    revenueCompare.textContent =
        `${percentage >= 0 ? "+" : ""}${percentage.toFixed(0)}% em relação ao mês passado.`;

}


/* =========================================================
   IMPACTO
========================================================= */

function renderImpact(
    data
) {

    const today =
        getTodayISO();


    const [
        year,
        month
    ] =
        today.split("-");


    const currentKey =
        `${year}-${month}`;


    const monthReservations =
        data.reservations.filter(
            reservation =>
                reservationIsActive(
                    reservation
                ) &&
                monthKeyFromBR(
                    reservation.reservationDate
                ) === currentKey
        );


    const saved =
        monthReservations.reduce(
            (
                total,
                reservation
            ) =>
                total +
                Number(
                    reservation.quantity || 0
                ),
            0
        );


    const avoidedKg =
        monthReservations.reduce(
            (
                total,
                reservation
            ) => {

                const offer =
                    getOfferById(
                        data,
                        reservation.offerId
                    );


                return (
                    total +
                    (
                        Number(
                            offer?.estimatedKgPerUnit
                        ) || 0
                    ) *
                    Number(
                        reservation.quantity || 0
                    )
                );

            },
            0
        );


    const people =
        new Set(
            monthReservations.map(
                reservation =>
                    reservation.customerName
                        .trim()
                        .toLowerCase()
            )
        ).size;


    impactGrid.innerHTML = `

        <div class="impact-item">

            <i class="
                fa-solid
                fa-bottle-water
            "></i>

            <strong>
                ${saved}
            </strong>

            <span>
                Itens<br>
                salvos
            </span>

        </div>


        <div class="impact-item">

            <i class="
                fa-solid
                fa-earth-americas
            "></i>

            <strong>
                ${avoidedKg.toFixed(1)}
                <small>kg</small>
            </strong>

            <span>
                Desperdício<br>
                evitado
            </span>

        </div>


        <div class="impact-item">

            <i class="
                fa-solid
                fa-people-group
            "></i>

            <strong>
                ${people}
            </strong>

            <span>
                Pessoas<br>
                atendidas
            </span>

        </div>

    `;

}


/* =========================================================
   GRÁFICO
========================================================= */

function buildMonthlySeries(
    data
) {

    const today =
        new Date(
            `${getTodayISO()}T12:00:00`
        );


    const months = [];


    for (
        let i = 5;
        i >= 0;
        i--
    ) {

        const date =
            new Date(
                today.getFullYear(),
                today.getMonth() - i,
                1
            );


        const key =
            `${date.getFullYear()}-${
                String(
                    date.getMonth() + 1
                ).padStart(2, "0")
            }`;


        months.push(key);

    }


    const reservations =
        months.map(
            key =>
                data.reservations

                    .filter(
                        reservation =>
                            reservationIsActive(
                                reservation
                            )
                    )

                    .filter(
                        reservation =>
                            monthKeyFromBR(
                                reservation.reservationDate
                            ) === key
                    )

                    .reduce(
                        (
                            total,
                            reservation
                        ) =>
                            total +
                            Number(
                                reservation.quantity || 0
                            ),
                        0
                    )
        );


    /*
        Neste protótipo os alimentos salvos
        acompanham as reservas.

        Posteriormente podemos alimentar
        essa série com um campo específico.
    */

    const foods =
        [...reservations];


    return {
        months,
        reservations,
        foods
    };

}


function drawChart(
    data
) {

    const rect =
        chart.getBoundingClientRect();


    const width =
        Math.max(
            rect.width || 600,
            320
        );


    const height =
        Math.max(
            rect.height || 220,
            170
        );


    const left =
        width < 450
            ? 34
            : 48;


    const right =
        width < 450
            ? 12
            : 22;


    const top = 18;


    const bottom =
        width < 450
            ? 30
            : 38;


    chart.setAttribute(
        "viewBox",
        `0 0 ${width} ${height}`
    );


    chart.innerHTML = "";


    const series =
        buildMonthlySeries(data);


    const max =
        Math.max(
            4,
            ...series.reservations,
            ...series.foods
        );


    const graphWidth =
        width -
        left -
        right;


    const graphHeight =
        height -
        top -
        bottom;


    const x = index =>
        left +
        (
            index *
            graphWidth /
            (
                series.months.length - 1
            )
        );


    const y = value =>
        top +
        graphHeight -
        (
            value /
            max
        ) *
        graphHeight;


    /*
        Grid
    */

    for (
        let step = 0;
        step <= 4;
        step++
    ) {

        const value =
            Math.round(
                (max / 4) *
                step
            );


        const yy =
            y(value);


        const line =
            document.createElementNS(
                "http://www.w3.org/2000/svg",
                "line"
            );


        line.setAttribute(
            "x1",
            left
        );


        line.setAttribute(
            "x2",
            width - right
        );


        line.setAttribute(
            "y1",
            yy
        );


        line.setAttribute(
            "y2",
            yy
        );


        line.setAttribute(
            "stroke",
            "#dedbd2"
        );


        line.setAttribute(
            "stroke-width",
            "1"
        );


        chart.appendChild(line);


        const text =
            document.createElementNS(
                "http://www.w3.org/2000/svg",
                "text"
            );


        text.setAttribute(
            "x",
            left - 7
        );


        text.setAttribute(
            "y",
            yy + 3
        );


        text.setAttribute(
            "text-anchor",
            "end"
        );


        text.setAttribute(
            "fill",
            "#89877f"
        );


        text.setAttribute(
            "font-size",
            width < 450
                ? "8"
                : "9"
        );


        text.textContent =
            value;


        chart.appendChild(text);

    }


    /*
        Meses
    */

    series.months.forEach(
        (key, index) => {

            const [
                year,
                month
            ] =
                key.split("-");


            const label =
                new Intl.DateTimeFormat(
                    "pt-BR",
                    {
                        month: "short"
                    }
                )
                    .format(
                        new Date(
                            Number(year),
                            Number(month) - 1,
                            1
                        )
                    )
                    .replace(".","");


            const text =
                document.createElementNS(
                    "http://www.w3.org/2000/svg",
                    "text"
                );


            text.setAttribute(
                "x",
                x(index)
            );


            text.setAttribute(
                "y",
                height - 8
            );


            text.setAttribute(
                "text-anchor",
                "middle"
            );


            text.setAttribute(
                "fill",
                "#77766f"
            );


            text.setAttribute(
                "font-size",
                width < 450
                    ? "8"
                    : "9"
            );


            text.textContent =
                label;


            chart.appendChild(text);

        }
    );


    /*
        Linha
    */

    function drawSeries(
        values,
        className
    ) {

        let pathData = "";


        values.forEach(
            (
                value,
                index
            ) => {

                pathData +=
                    `${
                        index === 0
                            ? "M"
                            : "L"
                    } ${
                        x(index)
                    } ${
                        y(value)
                    } `;

            }
        );


        const path =
            document.createElementNS(
                "http://www.w3.org/2000/svg",
                "path"
            );


        path.setAttribute(
            "d",
            pathData.trim()
        );


        path.setAttribute(
            "class",
            `chart-line ${className}`
        );


        const length =
            Math.max(
                path.getTotalLength(),
                100
            );


        path.style.setProperty(
            "--line-length",
            length
        );


        chart.appendChild(
            path
        );


        values.forEach(
            (
                value,
                index
            ) => {

                const point =
                    document.createElementNS(
                        "http://www.w3.org/2000/svg",
                        "circle"
                    );


                point.setAttribute(
                    "cx",
                    x(index)
                );


                point.setAttribute(
                    "cy",
                    y(value)
                );


                point.setAttribute(
                    "r",
                    width < 450
                        ? 3
                        : 3.5
                );


                point.setAttribute(
                    "class",
                    `chart-point ${className}`
                );


                point.setAttribute(
                    "fill",
                    className === "orange"
                        ? "#f15c43"
                        : "#527656"
                );


                point.style.animationDelay =
                    `${1.2 + index * .08}s`;


                chart.appendChild(
                    point
                );

            }
        );

    }


    drawSeries(
        series.reservations,
        "orange"
    );


    drawSeries(
        series.foods,
        "green"
    );


    chartPeriod.textContent =
        `Últimos ${series.months.length} meses`;

}


/* =========================================================
   ÚLTIMAS RESERVAS
========================================================= */

function renderRecentReservations(
    data
) {

    const list =
        [...data.reservations]
            .sort(
                (
                    a,
                    b
                ) =>
                    String(
                        b.createdAt
                    ).localeCompare(
                        String(
                            a.createdAt
                        )
                    )
            )
            .slice(
                0,
                5
            );


    if (!list.length) {

        recentReservations.innerHTML =
            `
                <div class="empty-state">
                    Nenhuma reserva cadastrada.
                </div>
            `;

        return;

    }


    recentReservations.innerHTML =
        list
            .map(
                reservation => `

                    <div class="recent-row">

                        <strong>
                            ${escapeHTML(
                                reservation.customerName
                            )}
                        </strong>

                        <span>
                            ${escapeHTML(
                                reservation.offerName
                            )}
                        </span>

                        <span>
                            ${escapeHTML(
                                reservation.code
                            )}
                        </span>

                        <span
                            class="
                                status-badge
                                ${
                                    reservation.status ===
                                    "Retirada"
                                        ? "completed"
                                        : reservation.status ===
                                          "Cancelada"
                                            ? "cancelled"
                                            : "waiting"
                                }
                            "
                        >
                            ${escapeHTML(
                                reservation.status
                            )}
                        </span>

                    </div>

                `
            )
            .join("");

}


/* =========================================================
   DASHBOARD
========================================================= */

function renderDashboard() {

    const data =
        loadData();


    renderStats(
        data
    );


    renderImpact(
        data
    );


    renderRevenue(
        data
    );


    renderRecentReservations(
        data
    );


    drawChart(
        data
    );

}


renderDashboard();


/* =========================================================
   GRÁFICO RESPONSIVO
========================================================= */

const chartObserver =
    new ResizeObserver(
        () => {

            drawChart(
                loadData()
            );

        }
    );


chartObserver.observe(
    document.querySelector(
        ".chart-wrap"
    )
);


/* =========================================================
   SINCRONIZAÇÃO
========================================================= */

window.addEventListener(
    DATA_EVENT,
    () => {

        renderDashboard();

    }
);