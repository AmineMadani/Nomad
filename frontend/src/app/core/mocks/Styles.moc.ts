export const style_aep_vanne: any[] = [
    {
        "id": "aep_vanne_fermee_robinet_style",
        "type": "symbol",
        "source": "aep_vanne",
        "minzoom": 14,
        "filter": ['all',
            ["==", ["get", "position"], "Fermé"],
            ["==", ["get", "type"], "Robinet/Opercule"]
        ],
        "layout": {
            "visibility":"none",
            "icon-allow-overlap": true,
            "icon-image": "AEP_VANNE_FERMEE_ROBINET",
            "icon-rotate": [
                "+",
                [
                    "get",
                    "angle"
                ],
                90
            ],
            "icon-rotation-alignment": "map",
            "icon-ignore-placement": true,
            "symbol-spacing": 10,
            "icon-size": 1,
            "symbol-sort-key": 1
        }
    },{
        "id": "aep_vanne_fermee_tour_style",
        "type": "symbol",
        "source": "aep_vanne",
        "minzoom": 14,
        "filter": ['all',
            ["==", ["get", "position"], "Fermé"],
            ["==", ["get", "type"], "1/4 de tour"]
        ],
        "layout": {
            "visibility":"none",
            "icon-allow-overlap": true,
            "icon-image": "AEP_VANNE_FERMEE_TOUR",
            "icon-rotate": [
                "+",
                [
                    "get",
                    "angle"
                ],
                90
            ],
            "icon-rotation-alignment": "map",
            "icon-ignore-placement": true,
            "symbol-spacing": 10,
            "icon-size": 1,
            "symbol-sort-key": 1
        }
    },{
        "id": "aep_vanne_fermee_electro_style",
        "type": "symbol",
        "source": "aep_vanne",
        "minzoom": 14,
        "filter": ['all',
            ["==", ["get", "position"], "Fermé"],
            ["==", ["get", "type"], "Electrovanne"]
        ],
        "layout": {
            "visibility":"none",
            "icon-allow-overlap": true,
            "icon-image": "AEP_VANNE_FERMEE_ELECTRO",
            "icon-rotate": [
                "+",
                [
                    "get",
                    "angle"
                ],
                90
            ],
            "icon-rotation-alignment": "map",
            "icon-ignore-placement": true,
            "symbol-spacing": 10,
            "icon-size": 1,
            "symbol-sort-key": 1
        }
    },
    {
        "id": "aep_vanne_ouvert_robinet_style",
        "type": "symbol",
        "source": "aep_vanne",
        "minzoom": 14,
        "filter": ['all',
            ["==", ["get", "position"], "Ouvert"],
            ["==", ["get", "type"], "Robinet/Opercule"]
        ],
        "layout": {
            "visibility":"none",
            "icon-allow-overlap": true,
            "icon-image": "AEP_VANNE_OUVERT_ROBINET",
            "icon-rotate": [
                "+",
                [
                    "get",
                    "angle"
                ],
                90
            ],
            "icon-rotation-alignment": "map",
            "icon-ignore-placement": true,
            "symbol-spacing": 10,
            "icon-size": 0.8,
            "symbol-sort-key": 2
        }
    },{
        "id": "aep_vanne_ouvert_tour_style",
        "type": "symbol",
        "source": "aep_vanne",
        "minzoom": 14,
        "filter": ['all',
            ["==", ["get", "position"], "Ouvert"],
            ["==", ["get", "type"], "1/4 de tour"]
        ],
        "layout": {
            "visibility":"none",
            "icon-allow-overlap": true,
            "icon-image": "AEP_VANNE_OUVERT_TOUR",
            "icon-rotate": [
                "+",
                [
                    "get",
                    "angle"
                ],
                90
            ],
            "icon-rotation-alignment": "map",
            "icon-ignore-placement": true,
            "symbol-spacing": 10,
            "icon-size": 1,
            "symbol-sort-key": 1
        }
    },{
        "id": "aep_vanne_ouvert_electro_style",
        "type": "symbol",
        "source": "aep_vanne",
        "minzoom": 14,
        "filter": ['all',
            ["==", ["get", "position"], "Ouvert"],
            ["==", ["get", "type"], "Electrovanne"]
        ],
        "layout": {
            "visibility":"none",
            "icon-allow-overlap": true,
            "icon-image": "AEP_VANNE_OUVERT_ELECTRO",
            "icon-rotate": [
                "+",
                [
                    "get",
                    "angle"
                ],
                90
            ],
            "icon-rotation-alignment": "map",
            "icon-ignore-placement": true,
            "symbol-spacing": 10,
            "icon-size": 1,
            "symbol-sort-key": 1
        }
    },
]

export const style_aep_vanne_old: any[] = [
    {
        "id": "aep_vanne_style2",
        "type": "circle",
        "source": "aep_vanne",
        "minzoom": 18,
        "layout": {},
        "paint": {
            "circle-radius": 30,
            "circle-color": "hsl(53, 59%, 79%)",
            "circle-blur": 0.5,
            "circle-opacity": [
                "case",
                [
                    "boolean",
                    [
                        "feature-state",
                        "hover"
                    ],
                    false
                ],
                1,
                0
            ]
        }
    },
    {
        "id": "aep_vanne_style1",
        "type": "symbol",
        "source": "aep_vanne",
        "minzoom": 14,
        "layout": {
            "icon-allow-overlap": true,
            "icon-image": [
                "case",
                ['all',
                    ["==", ["get", "position"], "Fermé"],
                    ["==", ["get", "type"], "Robinet/Opercule"]
                ]
                ,
                "AEP_VANNE_FERMEE_ROBINET",
                ['all',
                    ["==", ["get", "position"], "Fermé"],
                    ["==", ["get", "type"], "1/4 de tour"]
                ]
                ,
                "AEP_VANNE_FERMEE_TOUR",
                ['all',
                    ["==", ["get", "position"], "Fermé"],
                    ["==", ["get", "type"], "1/4 de tour"]
                ]
                ,
                "AEP_VANNE_OUVERT_ELECTRO",
                ['all',
                    ["==", ["get", "position"], "Ouvert"],
                    ["==", ["get", "type"], "Robinet/Opercule"]
                ]
                ,
                "AEP_VANNE_OUVERT_ROBINET",
                ['all',
                    ["==", ["get", "position"], "Ouvert"],
                    ["==", ["get", "type"], "1/4 de tour"]
                ]
                ,
                "AEP_VANNE_OUVERT_TOUR",
                ['all',
                    ["==", ["get", "position"], "Ouvert"],
                    ["==", ["get", "type"], "Electrovanne"]
                ]
                ,
                "AEP_VANNE_OUVERT_ELECTRO",
                ""
            ],
            "icon-rotate": [
                "+",
                [
                    "get",
                    "angle"
                ],
                90
            ],
            "icon-rotation-alignment": "map",
            "icon-ignore-placement": true,
            "icon-size": [
                "case",
                [
                    "==",
                    [
                        "get",
                        "position"
                    ],
                    "Fermé"
                ],
                1,
                0.8
            ],
            "symbol-spacing": 10,
            "symbol-sort-key": [
                "case",
                [
                    "==",
                    "position",
                    "Fermé"
                ],
                1,
                2
            ]
        },
        "paint": {}
    }
]

export const style_ass_regard: any[] = [{ "id": "ass_regard_point_style", "type": "circle", "source": "ass_regard", "minzoom": 10, "layout": {}, "paint": { "circle-radius": ["case", ["boolean", ["feature-state", "selected"], false], 20, ["boolean", ["feature-state", "hover"], false], 12, 7.5], "circle-color": "hsl(330, 20%, 20)", "circle-blur": 0.1, "circle-opacity": ["case", ["boolean", ["feature-state", "selected"], false], 1, ["boolean", ["feature-state", "hover"], false], 1, 0.7] } }]