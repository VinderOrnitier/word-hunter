import { fireEvent, render, screen } from "@testing-library/preact";
import { Select } from "../../../src/popup/components/Select";

describe("Select", () => {
  it("renders an <option> for each string option", () => {
    render(
      <Select value="animals" onChange={() => {}}>
        {[
          { value: "animals", label: "Animals" },
          { value: "pokemon", label: "Pokémon" },
        ]}
      </Select>
    );
    expect(screen.getByRole("option", { name: "Animals" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Pokémon" })).toBeInTheDocument();
  });

  it("reflects the value prop on the rendered select", () => {
    render(
      <Select value="pokemon" onChange={() => {}}>
        {[
          { value: "animals", label: "Animals" },
          { value: "pokemon", label: "Pokémon" },
        ]}
      </Select>
    );
    expect((screen.getByRole("combobox") as HTMLSelectElement).value).toBe("pokemon");
  });

  it("calls onChange with the new value when the user picks an option", () => {
    const onChange = jest.fn();
    render(
      <Select value="animals" onChange={onChange}>
        {[
          { value: "animals", label: "Animals" },
          { value: "pokemon", label: "Pokémon" },
        ]}
      </Select>
    );
    fireEvent.change(screen.getByRole("combobox"), {
      target: { value: "pokemon" },
    });
    expect(onChange).toHaveBeenCalledWith("pokemon");
  });

  it("accepts plain string options as well", () => {
    render(
      <Select value="fox" onChange={() => {}}>
        {["fox", "wolf"]}
      </Select>
    );
    expect(screen.getByRole("option", { name: "fox" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "wolf" })).toBeInTheDocument();
  });
});
