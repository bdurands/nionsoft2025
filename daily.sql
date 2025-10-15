CREATE TABLE daily_quest_progress
(
    id               INT UNSIGNED                                                   NOT NULL AUTO_INCREMENT,
    character_id     INT                                                            NOT NULL,
    quest_date       DATE                                                           NOT NULL,
    preset_id        INT                                                            NOT NULL,
    kill_count       INT                                                            NOT NULL DEFAULT 0,
    target_count     INT                                                            NOT NULL,
    claimed          TINYINT(1)                                                     NOT NULL DEFAULT 0,
    completed_presets TEXT CHARACTER SET latin1 COLLATE latin1_german1_ci          NULL COMMENT 'Comma-separated list of completed preset IDs for the day',
    last_updated     TIMESTAMP                                                      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    next_available   TIMESTAMP                                                      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY unique_char_date_preset (character_id, quest_date, preset_id),
    KEY idx_character_date (character_id, quest_date),
    KEY idx_next_available (character_id, next_available)
);