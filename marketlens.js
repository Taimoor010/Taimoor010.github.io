const form = document.querySelector("#predictionForm");
const modelStatus = document.querySelector("#modelStatus");
const predictedPrice = document.querySelector("#predictedPrice");
const priceRange = document.querySelector("#priceRange");
const dealPrice = document.querySelector("#dealPrice");
const confidenceRing = document.querySelector("#confidenceRing");
const confidenceScore = document.querySelector("#confidenceScore");
const confidenceLabel = document.querySelector("#confidenceLabel");
const confidenceDetail = document.querySelector("#confidenceDetail");
const cvMape = document.querySelector("#cvMape");
const trainMape = document.querySelector("#trainMape");

const makeSelect = document.querySelector("#make");
const modelSelect = document.querySelector("#model");
const variantSelect = document.querySelector("#variant");
const fuelSelect = document.querySelector("#fuelType");
const transmissionSelect = document.querySelector("#transmission");
const colorSelect = document.querySelector("#color");
const registeredInSelect = document.querySelector("#registeredIn");
const yearInput = document.querySelector("#yearInput");
const engineInput = document.querySelector("#engineCc");

document.querySelector("#year").textContent = new Date().getFullYear();

function option(value, label = value) {
  const item = document.createElement("option");
  item.value = value;
  item.textContent = label;
  return item;
}

function fillSelect(select, values, preferred) {
  select.innerHTML = "";
  values.forEach((value) => {
    const item = typeof value === "object"
      ? option(value.value, value.label)
      : option(value);
    if ((typeof value === "object" ? value.value : value) === preferred) {
      item.selected = true;
    }
    select.appendChild(item);
  });
}

function modelKey(...parts) {
  return window.MarketLensModel.key(parts);
}

function selectedMakeModelVariantKey() {
  return modelKey(makeSelect.value, modelSelect.value, variantSelect.value);
}

function updateModels() {
  const models = window.MarketLensModel.metadata.modelsByMake[makeSelect.value] || [];
  fillSelect(modelSelect, models, models[0]);
  updateVariants();
}

function updateVariants() {
  const key = modelKey(makeSelect.value, modelSelect.value);
  const variants = window.MarketLensModel.metadata.variantsByMakeModel[key] || [
    { label: "General", value: "General" },
  ];
  fillSelect(variantSelect, variants, variants[0]?.value);
  updateDependentOptions();
}

function updateDependentOptions() {
  const key = selectedMakeModelVariantKey();
  const fuels = window.MarketLensModel.metadata.fuelByMakeModelVariant[key] || ["Petrol"];
  const transmissions = window.MarketLensModel.metadata.transmissionByMakeModelVariant[key] || ["Automatic", "Manual"];
  fillSelect(fuelSelect, fuels, fuels[0]);
  fillSelect(transmissionSelect, transmissions, transmissions[0]);
  updateEngine();
}

function updateEngine() {
  const key = modelKey(makeSelect.value, modelSelect.value, variantSelect.value, fuelSelect.value);
  const engines = window.MarketLensModel.metadata.engineByMakeModelVariantFuel[key] || [];
  if (engines.length) {
    engineInput.value = engines[0];
  }
}

function loadModelMetadata() {
  const metadata = window.MarketLensModel.metadata;
  fillSelect(makeSelect, metadata.makes, "Toyota");
  if (!makeSelect.value) fillSelect(makeSelect, metadata.makes, metadata.makes[0]);
  updateModels();
  fillSelect(colorSelect, metadata.colors.filter((color) => color !== "Unlisted"), "White");
  fillSelect(registeredInSelect, metadata.registrationRegions, "Punjab");
  yearInput.min = metadata.yearMin;
  yearInput.max = Math.max(metadata.yearMax, new Date().getFullYear() + 1);
  cvMape.textContent = `${metadata.cvMapePercent.toFixed(2)}%`;
  trainMape.textContent = `${metadata.holdoutMapePercent.toFixed(2)}%`;
  modelStatus.textContent = "Ready";
}

function formPayload() {
  const data = new FormData(form);
  return {
    make: data.get("make"),
    model: data.get("model"),
    variant: data.get("variant"),
    fuel_type: data.get("fuel_type"),
    year: Number(data.get("year")),
    mileage_km: Number(data.get("mileage_km")),
    engine_cc: Number(data.get("engine_cc")),
    transmission: data.get("transmission"),
    color: data.get("color"),
    registered_in: data.get("registered_in"),
  };
}

function paintResult(result) {
  predictedPrice.textContent = result.prediction.formatted;
  priceRange.textContent = `90% range: ${result.range.formatted}`;
  dealPrice.textContent = `Expected deal price: ${result.deal.formatted}`;
  confidenceScore.textContent = `${result.confidence.score}`;
  confidenceLabel.textContent = result.confidence.label;
  confidenceDetail.textContent = `${result.confidence.make_model_support_rows.toLocaleString()} make/model rows and ${result.confidence.variant_support_rows.toLocaleString()} variant rows. ${result.confidence.reasons.join("; ")}.`;
  confidenceRing.style.setProperty("--score-angle", `${result.confidence.score * 3.6}deg`);
}

makeSelect.addEventListener("change", updateModels);
modelSelect.addEventListener("change", updateVariants);
variantSelect.addEventListener("change", updateDependentOptions);
fuelSelect.addEventListener("change", updateEngine);

form.addEventListener("submit", (event) => {
  event.preventDefault();
  modelStatus.textContent = "Estimating";

  try {
    const result = window.MarketLensModel.predict(formPayload());
    paintResult(result);
    if (typeof window.trackPortfolioEvent === "function") {
      window.trackPortfolioEvent("marketlens_estimate", {
        confidence_label: result.confidence.label,
        confidence_score: result.confidence.score,
        make: result.normalizedInput.canonical_make,
        model: result.normalizedInput.canonical_model_family,
      });
    }
    modelStatus.textContent = "Ready";
  } catch (error) {
    if (typeof window.trackPortfolioEvent === "function") {
      window.trackPortfolioEvent("marketlens_error", {
        error_message: error.message,
      });
    }
    predictedPrice.textContent = "Check inputs";
    priceRange.textContent = error.message;
    dealPrice.textContent = "";
    confidenceScore.textContent = "-";
    confidenceLabel.textContent = "No estimate";
    confidenceDetail.textContent = "";
    confidenceRing.style.setProperty("--score-angle", "0deg");
    modelStatus.textContent = "Needs input";
  }
});

loadModelMetadata();
