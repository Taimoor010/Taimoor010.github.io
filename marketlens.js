const form = document.querySelector("#predictionForm");
const modelStatus = document.querySelector("#modelStatus");
const predictedPrice = document.querySelector("#predictedPrice");
const priceRange = document.querySelector("#priceRange");
const confidenceRing = document.querySelector("#confidenceRing");
const confidenceScore = document.querySelector("#confidenceScore");
const confidenceLabel = document.querySelector("#confidenceLabel");
const confidenceDetail = document.querySelector("#confidenceDetail");
const cvMape = document.querySelector("#cvMape");
const trainMape = document.querySelector("#trainMape");
const variantSelect = document.querySelector("#variant");
const fuelSelect = document.querySelector("#fuelType");
const transmissionSelect = document.querySelector("#transmission");
const cityOptions = document.querySelector("#cityOptions");
const yearInput = document.querySelector("#yearInput");

document.querySelector("#year").textContent = new Date().getFullYear();

function fillSelect(select, values, preferred) {
  select.innerHTML = "";
  values.forEach((value) => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = value;
    if (value === preferred) option.selected = true;
    select.appendChild(option);
  });
}

function fillDatalist(list, values) {
  list.innerHTML = "";
  values.forEach((value) => {
    const option = document.createElement("option");
    option.value = value;
    list.appendChild(option);
  });
}

function loadModelMetadata() {
  const metadata = window.MarketLensModel.metadata;
  fillSelect(variantSelect, metadata.variants, "AWD");
  fillSelect(fuelSelect, metadata.fuelTypes, "Petrol");
  fillSelect(transmissionSelect, metadata.transmissions, "Automatic");
  fillDatalist(cityOptions, metadata.cities);
  yearInput.min = metadata.yearMin;
  yearInput.max = new Date().getFullYear() + 1;
  cvMape.textContent = metadata.modelCvMapePercent ? `${metadata.modelCvMapePercent.toFixed(2)}%` : "-";
  trainMape.textContent = metadata.trainingMapePercent ? `${metadata.trainingMapePercent.toFixed(2)}%` : "-";
  modelStatus.textContent = "Ready";
}

function formPayload() {
  const data = new FormData(form);
  return {
    variant: data.get("variant"),
    city: data.get("city"),
    year: Number(data.get("year")),
    mileage_km: Number(data.get("mileage_km")),
    fuel_type: data.get("fuel_type"),
    engine_cc: data.get("engine_cc"),
    transmission: data.get("transmission"),
    is_featured: data.get("is_featured") === "on",
  };
}

function paintResult(result) {
  predictedPrice.textContent = result.prediction.formatted;
  priceRange.textContent = result.range.formatted;
  confidenceScore.textContent = `${result.confidence.score}`;
  confidenceLabel.textContent = result.confidence.label;
  confidenceDetail.textContent = `${result.confidence.reference_count} comparable rows from ${result.confidence.reference_group}; typical error ${result.confidence.typical_abs_error_percent}%`;
  confidenceRing.style.setProperty("--score-angle", `${result.confidence.score * 3.6}deg`);
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  modelStatus.textContent = "Estimating";

  try {
    const result = window.MarketLensModel.predict(formPayload());
    paintResult(result);
    modelStatus.textContent = "Ready";
  } catch (error) {
    predictedPrice.textContent = "Check inputs";
    priceRange.textContent = error.message;
    confidenceScore.textContent = "-";
    confidenceLabel.textContent = "No estimate";
    confidenceDetail.textContent = "";
    confidenceRing.style.setProperty("--score-angle", "0deg");
    modelStatus.textContent = "Needs input";
  }
});

loadModelMetadata();
