var getDefaultStrategy = function(config) {
  var wsStrategy;
  if (config.encrypted) {
    wsStrategy = [
      ":best_connected_ever",
      ":ws_loop"
    ];
  } else {
    wsStrategy = [
      ":best_connected_ever",
      ":ws_loop",
      [":delayed", 2000, [":wss_loop"]]
    ];
  }

  return [
    [":def", "ws_options", {
      hostUnencrypted: config.wsHost + ":" + config.wsPort,
      hostEncrypted: config.wsHost + ":" + config.wssPort,
      httpPath: config.wsPath
    }],
    [":def", "wss_options", [":extend", ":ws_options", {
      encrypted: true
    }]],
    [":def", "timeouts", {
      loop: true,
      timeout: 15000,
      timeoutLimit: 60000
    }],

    [":def", "ws_manager", [":transport_manager", {
      lives: 2,
      minPingDelay: 10000,
      maxPingDelay: config.activity_timeout
    }]],

    [":def_transport", "ws", "ws", 3, ":ws_options", ":ws_manager"],
    [":def_transport", "wss", "ws", 3, ":wss_options", ":ws_manager"],

    [":def", "ws_loop", [":sequential", ":timeouts", ":ws"]],
    [":def", "wss_loop", [":sequential", ":timeouts", ":wss"]],

    [":def", "strategy",
      [":cached", 1800000,
        [":first_connected",
          [":if", [":is_supported", ":ws"],
            wsStrategy,
            ":wss_loop"
          ]
        ]
      ]
    ]
  ];
};

export default getDefaultStrategy;
