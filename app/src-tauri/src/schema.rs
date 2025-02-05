// @generated automatically by Diesel CLI.

diesel::table! {
    habit_completions (id) {
        id -> Text,
        habit_id -> Text,
        created_at -> Timestamp,
    }
}

diesel::table! {
    habits (id) {
        id -> Text,
        title -> Text,
        description -> Text,
        icon -> Text,
        is_archived -> Bool,
        created_at -> Timestamp,
        updated_at -> Timestamp,
    }
}

diesel::joinable!(habit_completions -> habits (habit_id));

diesel::allow_tables_to_appear_in_same_query!(
    habit_completions,
    habits,
);
