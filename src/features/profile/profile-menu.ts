export type ProfileMenuItem =
  | {
      key:
        | "public-view"
        | "notification-settings"
        | "user-settings"
        | "app-settings";
      label: string;
      route: string;
      destructive?: false;
    }
  | {
      key: "sign-out";
      label: string;
      route?: never;
      destructive: true;
    };

export function profileMenuItems(username?: string | null): ProfileMenuItem[] {
  return [
    ...(username
      ? [
          {
            key: "public-view" as const,
            label: "Public view",
            route: `/user/${username}`,
          },
        ]
      : []),
    {
      key: "notification-settings",
      label: "Notification settings",
      route: "/settings?section=notifications",
    },
    {
      key: "user-settings",
      label: "User settings",
      route: "/settings?section=profile",
    },
    {
      key: "app-settings",
      label: "App settings",
      route: "/settings",
    },
    {
      key: "sign-out",
      label: "Sign out",
      destructive: true,
    },
  ];
}
