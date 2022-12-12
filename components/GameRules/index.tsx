import { FC, HTMLAttributes, useState, useCallback } from "react";

import { Modal } from "../Modal";
import Text from "../Text";
import Arrowed from "../Arrowed";
import Line from "../Line";
import GameRulesGeneral from "./GameRulesGeneral";
import GameRulesMoves from "./GameRulesMoves";
import GameRulesNFTs from "./GameRulesNFTs";
import GameRulesPoints from "./GameRulesPoints";

export type Props = HTMLAttributes<HTMLDivElement>;

const tabs = ["General", "Moves", "NFTs", "Points"];

const GameRules: FC<Props> = ({ children, ...props }) => {
  const [activeTab, setActiveTab] = useState("General");

  const switchTab = useCallback(
    (
      e:
        | React.MouseEvent<HTMLDivElement>
        | React.MouseEvent<HTMLButtonElement>
        | React.MouseEvent<HTMLElement>,
      tab: string
    ) => {
      document
        .getElementById("overlay")
        ?.scrollTo({ top: 0, behavior: "smooth" });
      setActiveTab(tab);
    },
    []
  );

  const onClose = () => setActiveTab('General')

  return (
    <div
      {...props}
      css={(theme) => ({
        minWidth: "200px",
        color: theme.colors.text_title_light,
      })}
    >
      <Modal
        trigger={children}
        title="Game Rules"
        css={() => ({
          minHeight: "200px",
        })}
        onClose={onClose}
      >
        <div css={{ display: "flex", marginBottom: 50, marginTop: 20}}>
          {tabs.map((tab) => (
            <button
              onClick={(e) => switchTab(e, tab)}
              key={tab}
              tabIndex={1}
              css={{
                marginRight: 20,
                cursor: "pointer",
                marginTop: 10,
                background:
                  activeTab === tab ? "#181818" : "rgba(0, 0, 0, 0.1)",
                color: activeTab === tab ? "#fff" : "#000",
                borderRadius: 50,
                height: 34,
                border: 0,
                boxShadow: "none",
                width: 90,
                fontSize: 16,
                paddingTop: 1,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                transition: "all 300ms",
                "&:hover": {
                  background:
                    activeTab === tab
                      ? "rgba(0, 0, 0, 0.7)"
                      : "rgba(0, 0, 0, 0.2)",
                },
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* General */}
        {activeTab === "General" && (
          <div>
            <GameRulesGeneral />
          </div>
        )}

        {/* Moves */}
        {activeTab === "Moves" && (
          <div>
            <GameRulesMoves />
          </div>
        )}

        {/* NFTs */}
        {activeTab === "NFTs" && (
          <div>
            <GameRulesNFTs />
          </div>
        )}

        {/* Points */}
        {activeTab === "Points" && (
          <div>
            <GameRulesPoints />
          </div>
        )}

        <div>
          <Line css={{marginBottom: 40}}/>
          <div
            css={{
              display: "flex",
              justifyContent: tabs[tabs.indexOf(activeTab) - 1]
                ? "space-between"
                : "flex-end",
              alignItems: "center",
  
            }}
          >
            {tabs[tabs.indexOf(activeTab) - 1] && (
              <Text
                component="div"
                variant="label"
                css={() => ({
                  opacity: 0.6,
                  cursor: "pointer",
                  transition: "all 400ms",
                  "&:hover": {
                    opacity: 0.8,
                  },
                })}
                onClick={(e) => switchTab(e, tabs[tabs.indexOf(activeTab) - 1])}
              >
                <div
                  style={{
                    display: "inline-block",
                    transform: "rotate(180deg)",
                  }}
                >
                  <Arrowed></Arrowed>
                </div>
                {tabs[tabs.indexOf(activeTab) - 1]}
              </Text>
            )}

            {tabs[tabs.indexOf(activeTab) + 1] && (
              <Text
                component="div"
                variant="label"
                css={() => ({
                  opacity: 0.6,
                  cursor: "pointer",
                  transition: "all 400ms",
                  "&:hover": {
                    opacity: 0.8,
                  },
                })}
                onClick={(e) => switchTab(e, tabs[tabs.indexOf(activeTab) + 1])}
              >
                <Arrowed>{tabs[tabs.indexOf(activeTab) + 1]}</Arrowed>
              </Text>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default GameRules;
