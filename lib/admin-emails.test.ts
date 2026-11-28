import assert from "node:assert/strict";
import { test } from "node:test";

import { isConfiguredAdmin } from "./admin-emails";
import { dashboardRoles, decideRoleAccess } from "./authz";

test("the agency owner receives admin access without extra configuration", () => {
  assert.equal(isConfiguredAdmin("studyabroadconsultancy01@gmail.com"), true);
  assert.equal(isConfiguredAdmin(" StudyAbroadConsultancy01@gmail.com "), true);
});

test("additional configured admins remain supported", () => {
  assert.equal(
    isConfiguredAdmin(
      "staff@example.com",
      " other@example.com, STAFF@example.com ",
    ),
    true,
  );
  assert.equal(
    isConfiguredAdmin(
      "studyabroadconsultancy01@gmail.com",
      "staff@example.com",
    ),
    true,
  );
});

test("other addresses are not granted admin access", () => {
  for (const email of [
    "",
    "student@example.com",
    "studyabroadconsultancy01@gmail.com.evil.com",
  ]) {
    assert.equal(isConfiguredAdmin(email), false);
  }
});

test("admin panel access still requires an active signed-in staff account", () => {
  assert.equal(
    decideRoleAccess(
      "clerk-admin",
      { role: "admin", isActive: true },
      dashboardRoles,
    ),
    "ok",
  );
  assert.equal(
    decideRoleAccess(
      "clerk-counselor",
      { role: "counselor", isActive: true },
      dashboardRoles,
    ),
    "ok",
  );
  assert.equal(
    decideRoleAccess(
      "clerk-student",
      { role: "student", isActive: true },
      dashboardRoles,
    ),
    "forbidden",
  );
  assert.equal(
    decideRoleAccess(
      "clerk-admin",
      { role: "admin", isActive: false },
      dashboardRoles,
    ),
    "unauthenticated",
  );
  assert.equal(
    decideRoleAccess(null, { role: "admin", isActive: true }, dashboardRoles),
    "unauthenticated",
  );
});
