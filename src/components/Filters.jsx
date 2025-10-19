// The filters shown on the team listings page

import Tag from "@/src/components/Tag.jsx";

function FilterSelect({ label, options, value, onChange, name, icon }) {
  return (
    <div>
      <img src={icon} alt={label} />
      <label>
        {label}
        <select value={value} onChange={onChange} name={name}>
          {options.map((option, index) => (
            <option value={option} key={index}>
              {option === "" ? "All" : option}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}

export default function Filters({ filters, setFilters }) {
  const handleSelectionChange = (event, name) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: event.target.value,
    }));
  };

  const updateField = (type, value) => {
    setFilters({ ...filters, [type]: value });
  };

  return (
    <section className="filter">
      <details className="filter-menu">
        <summary>
          <img src="/filter.svg" alt="filter" />
          <div>
            <p>NFL Teams</p>
            <p>Sorted by {filters.sort || "Rating"}</p>
          </div>
        </summary>

        <form
          method="GET"
          onSubmit={(event) => {
            event.preventDefault();
            event.target.parentNode.removeAttribute("open");
          }}
        >
          <FilterSelect
            label="Division"
            options={[
              "",
              "AFC East",
              "AFC North",
              "AFC South",
              "AFC West",
              "NFC East",
              "NFC North",
              "NFC South",
              "NFC West",
            ]}
            value={filters.division}
            onChange={(event) => handleSelectionChange(event, "division")}
            name="division"
            icon="/food.svg"
          />

          <FilterSelect
            label="City"
            options={[
              "",
              "Kansas City",
              "Buffalo",
              "Miami",
              "Boston",
              "New York",
              "Baltimore",
              "Cincinnati",
              "Cleveland",
              "Pittsburgh",
              "Houston",
              "Indianapolis",
              "Jacksonville",
              "Nashville",
              "Denver",
              "Las Vegas",
              "Los Angeles",
              "Dallas",
              "Philadelphia",
              "Washington",
              "Chicago",
              "Detroit",
              "Green Bay",
              "Minneapolis",
              "Atlanta",
              "Charlotte",
              "New Orleans",
              "Tampa Bay",
              "Phoenix",
              "San Francisco",
              "Seattle",
            ]}
            value={filters.city}
            onChange={(event) => handleSelectionChange(event, "city")}
            name="city"
            icon="/location.svg"
          />

          <FilterSelect
            label="Conference"
            options={["", "AFC", "NFC"]}
            value={filters.conference}
            onChange={(event) => handleSelectionChange(event, "conference")}
            name="conference"
            icon="/price.svg"
          />

          <FilterSelect
            label="Sort"
            options={["Rating", "Wins", "Discussions"]}
            value={filters.sort}
            onChange={(event) => handleSelectionChange(event, "sort")}
            name="sort"
            icon="/sortBy.svg"
          />

          <footer>
            <menu>
              <button
                className="button--cancel"
                type="reset"
                onClick={() => {
                  setFilters({
                    city: "",
                    division: "",
                    conference: "",
                    sort: "",
                  });
                }}
              >
                Reset
              </button>
              <button type="submit" className="button--confirm">
                Submit
              </button>
            </menu>
          </footer>
        </form>
      </details>

      <div className="tags">
        {Object.entries(filters).map(([type, value]) => {
          // The main filter bar already specifies what
          // sorting is being used. So skip showing the
          // sorting as a 'tag'
          if (type == "sort" || value == "") {
            return null;
          }
          return (
            <Tag
              key={value}
              type={type}
              value={value}
              updateField={updateField}
            />
          );
        })}
      </div>
    </section>
  );
}
