function checkEligibility(records) {
  // records = [{ app: "Swiggy", date: "2026-04-12" }, { app: "Zomato", date: "2026-04-13" }, ...]
  
  const daysByApp = {};
  for (const r of records) {
    if (!daysByApp[r.app]) daysByApp[r.app] = new Set();
    daysByApp[r.app].add(r.date); // Set avoids counting the same day twice
  }

  const perAppDays = {};
  let combinedDays = 0;
  for (const app in daysByApp) {
    perAppDays[app] = daysByApp[app].size;
    combinedDays += daysByApp[app].size;
  }

  const singleAppQualifies = Object.values(perAppDays).some(d => d >= 90);
  const combinedQualifies = combinedDays >= 120;

  return {
    perAppDays,
    combinedDays,
    qualifies: singleAppQualifies || combinedQualifies,
    message: singleAppQualifies
      ? "You qualify — you've crossed 90 days with a single app."
      : combinedQualifies
        ? "You qualify — your combined days across apps cross 120."
        : `Not yet. You have ${combinedDays} combined days. You need 120.`
  };
}

export { checkEligibility };