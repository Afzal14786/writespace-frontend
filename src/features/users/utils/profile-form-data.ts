import type { UpdateProfilePayload } from "@/features/users/types/user.types";

export function buildUpdateProfileFormData(
  payload: UpdateProfilePayload,
): FormData {
  const formData = new FormData();

  if (payload.personal_info) {
    formData.append("personal_info", JSON.stringify(payload.personal_info));
  }

  if (payload.social_links) {
    formData.append("social_links", JSON.stringify(payload.social_links));
  }

  if (payload.profileImage) {
    formData.append("profileImage", payload.profileImage);
  }

  if (payload.bannerImage) {
    formData.append("bannerImage", payload.bannerImage);
  }

  return formData;
}
